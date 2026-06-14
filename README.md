# 🛠️ IdeaForge — Purpose Idea Tool

IdeaForge is an intelligent, full-stack prototyping workbench that turns global themes, local challenges, and custom seed prompts into fully interactive, single-file HTML mockups and templates.

Powered by a dual-agent architecture, IdeaForge first conceptualizes comprehensive solution blueprints—evaluating socioeconomic threats, critical bottlenecks, and operational ratings—and then compiles them into functional front-end live frames.

## ✨ Core Features

- 🧠 **Dual-Agent Architecture:**
  - **Conceptualization Agent:** Evaluates challenges and drafts full, formatted project manifestos.
  - **Synthesis Agent:** Interprets blueprint ideas and compiles them into standalone, responsive HTML/Tailwind CSS interactive mockups.
- 📱 **Responsive Preview Canvas:** Instantly test synthetic applications in integrated desktop or mobile viewports.
- 💾 **HTML Source Inspector:** Read, format, and review generated page structures side-by-side with your sandbox canvas.
- 📥 **Stand-Alone Export:** Instantly download fully complete, self-contained interactive prototype files with a single click.
- ⚡ **Rate Recovery Robustness:** Advanced failure-resistant endpoints styled to survive real-time demand peaks with backoff retry paradigms.

## 🚀 Tech Stack

### Client Frontend
* **Framework:** React 19 + TypeScript
* **Animations:** Motion (`motion/react`)
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide Icons

### Server Backend
* **Environment:** Node.js + Express
* **APIs:** Google `@google/genai` SDK
* **Persistence:** Firebase (Auth, Firestore) for tracking, limits, and creation logs
* **Production Build:** `esbuild` for CJS self-contained execution bundling

---

## 🛠️ Local Environment Setup

Follow these quick steps to host your own copy of **IdeaForge**:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/IdeaForge.git
cd IdeaForge
npm install
