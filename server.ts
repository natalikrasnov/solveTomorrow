import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { initDb, readSessions, saveSession, writeSessions, getSessionById, deleteSession, getUserCredits, addCreditsForUser } from "./server/db.ts";
import { IdeaSession } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize file-based DB
initDb();

// Request body limits configuration
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined. Please verify your Secrets configuration.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to parse Gemini error objects or stringified messages for user-friendly UI display
function parseGeminiErrorMessage(err: any): string {
  const errMsg = err?.message || "";
  try {
    if (typeof errMsg === "string" && errMsg.trim().startsWith("{")) {
      const parsed = JSON.parse(errMsg);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }

  const errStr = typeof err === "string" ? err : JSON.stringify(err);
  if (errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("demand") || errStr.includes("Service Unavailable")) {
    return "The Gemini AI model is currently experiencing temporary high demand and rate spikes. Please wait a moment and click the button to try again.";
  }
  if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("limit")) {
    return "The AI engine is temporarily rate-limited due to heavy usage. Please wait 10-15 seconds and try again.";
  }

  return (err?.message || "An unexpected error occurred during blueprint/mockup compilation.");
}

// Durable exponential backoff query handler to survive 503/429 spikes
async function generateContentWithRetry(ai: any, params: any, maxRetries = 2, delayMs = 1200): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const errStr = (err?.message || "") + " " + JSON.stringify(err);
      const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("Service Unavailable") || errStr.includes("demand");
      const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("limit");
      
      console.warn(`[Gemini API] Attempt ${attempt} / ${maxRetries + 1} failed. Status retriable: ${is503 || is429}. Error details: ${err.message || err}`);
      
      if (attempt <= maxRetries && (is503 || is429)) {
        const sleepTime = delayMs * Math.pow(2.2, attempt - 1) + Math.random() * 400;
        console.log(`[Gemini API] Retrying in ${Math.round(sleepTime)}ms due to rate limit/temporary overload...`);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
        continue;
      }
      throw err;
    }
  }
}

// Helper to extract & decode Firebase ID token to get User ID
function getUserIdFromRequest(req: express.Request): string {
  const authHeader = (req.headers["x-authorization"] as string) || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Base64URL string decoding
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payloadBuf = Buffer.from(base64, "base64");
        const payload = JSON.parse(payloadBuf.toString("utf-8"));
        return payload.user_id || payload.sub || payload.uid || "anonymous_user";
      }
    } catch (e) {
      console.error("Error decoding authentication token:", e);
    }
  }
  return "anonymous_user";
}

// Helper to check user generation quotas
function checkUserGenerationQuota(userId: string): { allowed: boolean; used: number; maxAllowed: number; error?: string } {
  const sessions = readSessions();
  const used = sessions.filter(s => {
    if (userId === "anonymous_user") {
      return !s.userId || s.userId === "anonymous_user";
    }
    return s.userId === userId;
  }).length;

  const freeLimit = userId === "anonymous_user" ? 3 : 10;
  const credits = getUserCredits(userId);
  const additional = credits ? credits.additionalGenerations : 0;
  const maxAllowed = freeLimit + additional;

  if (used >= maxAllowed) {
    return {
      allowed: false,
      used,
      maxAllowed,
      error: `Upgrade Required: You have reached your limit of ${maxAllowed} generations (${used} used). Please open Settings in the left sideboard to upgrade your account credits via Google Pay or Apple Pay to continue.`
    };
  }

  return { allowed: true, used, maxAllowed };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Endpoint: Health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint: GET user limits & generation quota balances
app.get("/api/user/limits", (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const sessions = readSessions();
    const used = sessions.filter(s => {
      if (userId === "anonymous_user") {
        return !s.userId || s.userId === "anonymous_user";
      }
      return s.userId === userId;
    }).length;

    const freeLimit = userId === "anonymous_user" ? 3 : 10;
    const credits = getUserCredits(userId);
    const additional = credits ? credits.additionalGenerations : 0;
    const maxAllowed = freeLimit + additional;

    res.json({
      userId,
      generationsUsed: used,
      maxGenerations: maxAllowed,
      isPremium: additional > 0,
      freeLimit,
      additionalGenerations: additional,
      totalPaid: credits ? credits.totalPaid : 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: POST client payment verification & credit upgrades (Google Pay / Apple Pay simulation)
app.post("/api/user/pay", (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (userId === "anonymous_user") {
      return res.status(403).json({ error: "Please sign in to upgrade your generation limit and credits." });
    }
    
    const { amount, creditCount, provider } = req.body;
    if (!amount || !creditCount) {
      return res.status(400).json({ error: "Invalid payment blueprint values received." });
    }

    // Adjust user limits in database and save
    const record = addCreditsForUser(userId, amount, creditCount);

    res.json({
      success: true,
      message: `Successfully processed payment of $${amount.toFixed(2)} via ${provider === "apple_pay" ? "Apple Pay" : "Google Pay"}. Added ${creditCount} generations!`,
      creditRecord: record
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: GET all session histories associated with user
app.get("/api/ideas/history", (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const sessions = readSessions();
    
    // Self-heal any sessions that were marked COMPLETED but do not have generated HTML
    let databaseModified = false;
    const sanitized = sessions.map(s => {
      if (s.status === "COMPLETED" && !s.generatedHtml) {
        s.status = "IDEA_GENERATED";
        databaseModified = true;
      }
      return s;
    });
    if (databaseModified) {
      writeSessions(sanitized);
    }

    // Filter sessions belonging to current user or anonymous
    const filtered = sanitized.filter(s => {
      if (userId === "anonymous_user") {
        return !s.userId || s.userId === "anonymous_user";
      }
      return s.userId === userId;
    });
    // Return sorted descending by date
    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: GET live dynamic global statistics
app.get("/api/ideas/global-stats", (req, res) => {
  try {
    const sessions = readSessions();
    
    // Compute actual real-time figures based on custom baseline & creations
    const totalIdeasBase = 120;
    const totalIdeas = totalIdeasBase + sessions.length;

    // Completed live demos count
    const completedDemosBase = 14;
    const completedDemos = completedDemosBase + sessions.filter(s => s.status === "COMPLETED").length;

    // Positive impact votes / hearts
    const totalHeartsFromDb = sessions.reduce((acc, s) => acc + ((s as any).likesCount || 0), 0);
    const positiveImpactBase = 8400;
    const positiveImpact = positiveImpactBase + totalHeartsFromDb;

    // Unique countries/topics
    const uniqueTopicsBase = 32;
    const uniqueTopics = uniqueTopicsBase + new Set(sessions.map(s => s.userInput.topic)).size;

    res.json({
      totalIdeas,
      completedDemos,
      positiveImpact,
      countriesCount: uniqueTopics
    });
  } catch (err: any) {
    res.status(550).json({ error: err.message });
  }
});

// Endpoint: POST upvote/like a concept session
app.post("/api/ideas/:id/like", (req, res) => {
  try {
    const { id } = req.params;
    const sessions = readSessions();
    const index = sessions.findIndex(s => s._id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Session not found." });
    }

    const session = sessions[index];
    if (!(session as any).likesCount) {
      (session as any).likesCount = 0;
    }
    (session as any).likesCount += 1;
    
    saveSession(session);
    res.json({ success: true, likesCount: (session as any).likesCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: DELETE a session (authorized)
app.delete("/api/ideas/:id", (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const session = getSessionById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }
    // Prevent unauthenticated cross-mutation
    if (session.userId && session.userId !== "anonymous_user" && session.userId !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this session." });
    }
    const deleted = deleteSession(id);
    if (deleted) {
      res.json({ success: true, message: "Session removed successfully." });
    } else {
      res.status(404).json({ error: "Session not found." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: POST create/generate an Idea Blueprint
app.post("/api/ideas/generate", async (req, res) => {
  const { topic, freeText, model = "gemini-3.5-flash" } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "A prompt topic is required to initiate generation!" });
  }

  const userId = getUserIdFromRequest(req);
  const quota = checkUserGenerationQuota(userId);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, limitExceeded: true });
  }

  try {
    const ai = getGeminiClient();

    const systemPrompt = `You are a visionary Product Strategist, UX Designer, and Social Innovation Expert.
Your task is to conceptualize a highly engaging, unique, and realistic Single-Page Web Application mockup solution that addresses a critical challenge related to the user's selected topic.

Create:
1. Title: A concise, memorable, and modern name (avoiding robotic prefixes, e.g. use organic, human-friendly names).
2. Problem Statement: A clear, eye-opening description of the specific challenge.
3. Solution: A compelling description of how the proposed web app addresses this challenge.
4. Core Features: Exactly 3 to 4 distinct major features that can be demonstrated interactively. Provide clear, descriptive summaries for each feature.
5. Challenge Breakdown: Identify two specific key bottlenecks or threats (e.g. Critical Bottleneck, Socioeconomic Threat), providing a title and short description for each.
6. Solution Breakdown: Provide two key modules of your solution, detailing titles and descriptions of how each module solves the problem.
7. Quantitative Baseline Metrics: Design two custom KPIs/metrics for the problem space, with progress percentages between 40 and 95 (e.g., "CO2 Reductions", "+12,000t", baseline 75%).
8. Feasibility Confidence Rating: A score and comment on real-world feasibility.`;

    const userPrompt = `Develop a software concept centered on:
Topic: ${topic === "Anything (Random Global Idea)" ? "A completely random, extremely original, impact-driven global problem and solution idea (such as sub-saharan solar well water telemetry, urban heatwave maps, local food surplus routing logistics, forest fire tracking via acoustic sensors, space debris orbit maps, ocean plastic bio-filters, or another original social/ecological vision where the web application can provide real-world simulation value)." : topic}
${freeText ? `Specific User Preference/Guideline: "${freeText}"` : "(No custom preferences provided)"}

Provide your response in strict JSON format matching the schema instructions.`;

    const response = await generateContentWithRetry(ai, {
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "MEMORABLE catchy name for the application (e.g. FloraPulse or TerraLedger)" },
            problemStatement: { type: Type.STRING, description: "Specific challenge being addressed" },
            proposedSolution: { type: Type.STRING, description: "Detailed description of how the application resolves the challenge" },
            coreFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 core specific feature names along with interactive outcomes to showcase"
            },
            challenge1Name: { type: Type.STRING, description: "E.g. Food Inequality Levels or Soil Erosion Depth" },
            challenge1Desc: { type: Type.STRING, description: "Specific data-backed description of the first critical bottleneck" },
            challenge2Name: { type: Type.STRING, description: "E.g. Landfill Decomposing Damage or Local Income Loss" },
            challenge2Desc: { type: Type.STRING, description: "Specific description of the secondary threat or environmental damage" },
            solutionTitle: { type: Type.STRING, description: "Name of the global mitigation paradigm, e.g. Zero Surplus Logistics" },
            solutionBox1Title: { type: Type.STRING, description: "First core module title, e.g. Live Surge Matches" },
            solutionBox1Desc: { type: Type.STRING, description: "How this module works dynamically" },
            solutionBox2Title: { type: Type.STRING, description: "Second core module title, e.g. Prone Cold-Chain Ledger" },
            solutionBox2Desc: { type: Type.STRING, description: "Description under second key module" },
            confidence: { type: Type.STRING, description: "A percentage value, e.g. 93.6%" },
            confidenceText: { type: Type.STRING, description: "E.g. 93.6% - Operational Grade" },
            metric1Name: { type: Type.STRING, description: "Name of the first KPI, e.g. MEALS SAVED" },
            metric1Value: { type: Type.STRING, description: "Metric result label, e.g. +45,000 Safe Meals" },
            metric1Percent: { type: Type.INTEGER, description: "BASELINE progress value between 40 and 95" },
            metric2Name: { type: Type.STRING, description: "Name of the second KPI, e.g. CARBON OFFSET" },
            metric2Value: { type: Type.STRING, description: "Metric result label, e.g. 88% Clean Salvage" },
            metric2Percent: { type: Type.INTEGER, description: "BASELINE progress value between 40 and 95" }
          },
          required: [
            "title", "problemStatement", "proposedSolution", "coreFeatures",
            "challenge1Name", "challenge1Desc", "challenge2Name", "challenge2Desc",
            "solutionTitle", "solutionBox1Title", "solutionBox1Desc", "solutionBox2Title", "solutionBox2Desc",
            "confidence", "confidenceText",
            "metric1Name", "metric1Value", "metric1Percent",
            "metric2Name", "metric2Value", "metric2Percent"
          ]
        }
      }
    });

    const choiceText = response.text;
    if (!choiceText) {
      throw new Error("Empty response received from the AI agent model.");
    }

    const parsedIdea = JSON.parse(choiceText.trim());

    const userId = getUserIdFromRequest(req);
    // Create session save item
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: IdeaSession = {
      _id: sessionId,
      userId: userId,
      userInput: { topic, freeTextPrompt: freeText || "" },
      generatedIdea: parsedIdea,
      status: "IDEA_GENERATED",
      generatedHtml: null,
      createdAt: new Date().toISOString()
    };

    saveSession(newSession);

    res.json({ sessionId, idea: parsedIdea });
  } catch (err: any) {
    console.error("Idea generator error:", err);
    res.status(500).json({ error: parseGeminiErrorMessage(err) });
  }
});

// Endpoint: POST generate responsive HTML demo mockup (Agent 2)
app.post("/api/ideas/generate-code", async (req, res) => {
  const { sessionId, model = "gemini-3.5-flash" } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Active session ID is required to synthesize HTML code!" });
  }

  const session = getSessionById(sessionId);
  if (!session) {
    return res.status(404).json({ error: "The requested session doesn't exist." });
  }

  const userId = getUserIdFromRequest(req);
  if (session.userId && session.userId !== "anonymous_user" && session.userId !== userId) {
    return res.status(403).json({ error: "Unauthorized access to this session." });
  }

  const quota = checkUserGenerationQuota(userId);
  if (!session.generatedHtml && !quota.allowed) {
    return res.status(403).json({ error: quota.error, limitExceeded: true });
  }

  try {
    session.status = "CODE_GENERATING";
    saveSession(session);

    const ai = getGeminiClient();

    const { title, problemStatement, proposedSolution, coreFeatures } = session.generatedIdea;

    const codePrompt = `You are a legendary Principal Frontend Developer and UX Designer who crafts gorgeous, ultra-polished, responsive Single Page Applications (SPAs).
Your goal is to build an outstanding, production-ready, highly interactive dashboard demo for the app "${title}".

CONTEXT OF APP:
- Problem Statement: ${problemStatement}
- Proposed Solution: ${proposedSolution}
- Core Features to Showcase: ${coreFeatures.join(", ")}

TECHNICAL REQUIREMENTS:
1. Produce a SINGLE, self-contained HTML document. All styles and interactive JS behaviors MUST be bundled inside this single file.
2. Styling: Import Tailwind CSS via its CDN:
   <script src="https://cdn.tailwindcss.com"></script>
   - Select a highly refined, premium theme appropriate to the topic (e.g. emerald/teal for Climate, violet/indigo for Tech, slate/slate for Minimal).
   - Use beautiful modern fonts like "Inter" or "Outfit" via Google Fonts import.
   - Use high-contrast, comfortable light mode by default, or an extremely clean, stylish slate/twilight dark theme only if matches the theme beautifully.
   - Include soft microshadows, smooth scale transitions, bento-grid components, and dynamic hover effects.
3. Interactive Icons: Load and initialize Lucide icons via CDN:
   <script src="https://unpkg.com/lucide@latest"></script>
   And always make sure to call "lucide.createIcons()" at the end of the script tag so they render!
4. Real Interactive Client-side Scripting (essential for a stellar live demo!):
   - Direct JS click-handlers, dynamic variable states, list management, tab switches, and live interactive simulators.
   - When a user interacts with the feature modules (e.g., clicks "Calculate Eco-Impact", "Add Custom Task", "Simulate Cloud Deployment", or inputs figures), the script MUST dynamically update elements on the screen to show realistic results, counters, status updates, or visual meters/meters.
   - Implement an interactive "Live Sandbox Logs" or "Simulation Console" widget at the bottom of the dashboard that adds diagnostic lines as the user clicks different interactive buttons.
   - Pre-populate beautiful default mock data that simulates real usage.
5. Code Integrity: Write complete, clean code. Do NOT output code wrapped in markdown blocks (no backticks, no \`\`\`html wrapper). Just start with <!DOCTYPE html> and end with </html>.
`;

    const response = await generateContentWithRetry(ai, {
      model: model,
      contents: codePrompt,
      config: {
        systemInstruction: "You only output complete, pristine, responsive self-contained raw HTML files with inline CSS and interactive vanilla Javascript mockup code. No explanations, no markdown blocks."
      }
    });

    let codeResult = response.text;
    if (!codeResult) {
      throw new Error("No code output was returned by the code generation agent.");
    }

    // High confidence cleaning of any accidental markdown codeblock wrappers
    let cleanCode = codeResult.trim();
    if (cleanCode.startsWith("```html")) {
      cleanCode = cleanCode.substring(7);
    } else if (cleanCode.startsWith("```")) {
      cleanCode = cleanCode.substring(3);
    }
    if (cleanCode.endsWith("```")) {
      cleanCode = cleanCode.substring(0, cleanCode.length - 3);
    }
    cleanCode = cleanCode.trim();

    session.generatedHtml = cleanCode;
    session.status = "COMPLETED";
    saveSession(session);

    res.json({ generatedHtml: cleanCode });
  } catch (err: any) {
    console.error("Code generator error:", err);
    session.status = "IDEA_GENERATED"; // Revert status so user can retry
    session.generatedHtml = null;
    saveSession(session);
    res.status(500).json({ error: parseGeminiErrorMessage(err) });
  }
});

// ----------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares for local dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Static production build serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IdeaForge App Server booted successfully! Listening on port ${PORT}`);
  });
}

startServer();
