import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  History, 
  ArrowRight, 
  RotateCcw, 
  Monitor, 
  Smartphone,
  Download, 
  Copy, 
  Check, 
  Briefcase, 
  Lightbulb, 
  Code2, 
  ExternalLink,
  Trash2,
  Search,
  Globe,
  Settings,
  X,
  Play,
  LogOut,
  LogIn,
  Info,
  Menu,
  Heart,
  Leaf,
  Brain,
  GraduationCap,
  Sprout,
  Recycle,
  Code,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './firebase';
import { IdeaSession, UserInput, GeneratedIdea, UserLimitInfo } from './types';

const TOPIC_PRESETS = [
  {
    name: 'Climate Change & Green Grid',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=400',
    tagline: 'Restore our Planet',
    description: 'Optimize clean energy allocation & decrease global carbon footprint tracking with smart algorithms.',
    impactQuote: 'Smart power grids can save gigatons of carbon emissions.',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: 'Mental Health Companion AI',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400',
    tagline: 'Cultivate Daily Peace',
    description: 'Provide an AI safe-space for meditation loops, crisis text guidance, and friendly community tracking.',
    impactQuote: 'No veteran, child, or soul should have to walk through darkness alone.',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
  },
  {
    name: 'Financial Literacy for Kids',
    image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    tagline: 'Empower Future Minds',
    description: 'Gamify micro-budgets, small saving habits, and smart currency exercises for young developers.',
    impactQuote: 'Socioeconomic autonomy starts with understanding core assets.',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'Hyperlocal Micro-Farming Hub',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
    tagline: 'Eradicate Food Deserts',
    description: 'Automate high-yield family soil planting directions, crop swaps, and hyperlocal neighborhood grids.',
    impactQuote: 'Direct nutritional security starts locally in neighbor backyards.',
    badgeColor: 'text-lime-400 bg-lime-500/10 border-lime-500/20'
  },
  {
    name: 'Adaptive Dyslexia Learning',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400',
    tagline: 'Democratize Education',
    description: 'Empower dynamic readers with high-contrast text layout filters and dyslexic-friendly UI spacing.',
    impactQuote: 'Unlocking literacy unlocks a child’s creative destiny.',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    name: 'Civic Food Waste Router',
    image: 'https://images.unsplash.com/photo-1595273670150-db0d3bf36b5a?auto=format&fit=crop&q=80&w=400',
    tagline: 'Sustain Hunger Logistics',
    description: 'Divert left-over retail food yields and grocery clearances safely to nearby pantry houses.',
    impactQuote: 'Global hunger is first and foremost an offline deployment issue.',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  },
  {
    name: 'Anything (Random Global Idea)',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
    tagline: 'Heal the Timeline',
    description: 'Instruct the double-agent generator engine to cook up a completely randomized global solution.',
    impactQuote: 'One tiny spark of positive creative energy fixes tomorrow.',
    badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20'
  }
];

const BLUEPRINT_DATA: Record<string, {
  title: string;
  tagline: string;
  challenge1Name: string;
  challenge1Desc: string;
  challenge2Name: string;
  challenge2Desc: string;
  confidence: string;
  confidenceText: string;
  solutionTitle: string;
  solutionBox1Title: string;
  solutionBox1Desc: string;
  solutionBox2Title: string;
  solutionBox2Desc: string;
  image: string;
  metric1Name: string;
  metric1Value: string;
  metric1Percent: number;
  metric2Name: string;
  metric2Value: string;
  metric2Percent: number;
  mapImage: string;
}> = {
  'Climate Change & Green Grid': {
    title: 'Carbon Sentinel Network',
    tagline: 'An AI-orchestrated autonomous smart power network optimizing distributed solar grids and carbon offset allocations.',
    challenge1Name: 'Grid Inequality & Dissipation',
    challenge1Desc: 'High-density urban sectors face 30% grid overload while adjacent community solar fields dump clean offset potential.',
    challenge2Name: 'Peaker Fossil Overload',
    challenge2Desc: 'Traditional peaker plants generate up to 400% more carbon emissions during chaotic evening surges.',
    solutionTitle: 'Smart Sentinel Protocol',
    solutionBox1Title: 'Predictive Load Shifting',
    solutionBox1Desc: 'Smart neural controllers defer non-urgent residential power demands during hyper-loads.',
    solutionBox2Title: 'Micro-Offset Tokens',
    solutionBox2Desc: 'Automated metering protocols instantly stream energy balancing credits to local green restorers.',
    confidence: '96.4%',
    confidenceText: '96.4% - Strategic Priority',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'CO2 DISPLACEMENT RATIO',
    metric1Value: '+24,000t Saved',
    metric1Percent: 75,
    metric2Name: 'RENEWABLE INTEGRATION',
    metric2Value: '92% Efficiency',
    metric2Percent: 92,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Mental Health Companion AI': {
    title: 'Aura Breath Support Loop',
    tagline: 'A bio-adaptive feedback sanctuary providing real-time calming flows and encrypted peer responder grids.',
    challenge1Name: 'Isolation & Stigma Surge',
    challenge1Desc: 'Over 65% of students report critical, persistent anxiety with minimal access to private support systems.',
    challenge2Name: 'Crisis Routing Thresholds',
    challenge2Desc: 'Underfunded support hubs experience 3-hour backlogs during peak high-stress atmospheric periods.',
    solutionTitle: 'The Aura Companion Core',
    solutionBox1Title: 'Live Bio-Frequencies',
    solutionBox1Desc: 'Interactive vocal sentiment and stress tracking adapts respiration visualizers dynamically.',
    solutionBox2Title: 'Fully Private Routing',
    solutionBox2Desc: 'Zero-knowledge encrypted networks route urgent distress nodes to certified local mutual aid volunteers.',
    confidence: '92.8%',
    confidenceText: '92.8% - Deep Empathy Range',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'ANXIETY INDEX CRUSHED',
    metric1Value: '-45% Overall Stress',
    metric1Percent: 82,
    metric2Name: 'ENGAGEMENT RETENTION',
    metric2Value: '85% Daily Comfort',
    metric2Percent: 85,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Financial Literacy for Kids': {
    title: 'Piggy Ledger Gamification',
    tagline: 'Interactive children budget sandboxes, smart micro-rewards, and local socioeconomic simulation games.',
    challenge1Name: 'Early Asset Illiteracy',
    challenge1Desc: '90% of students enter adulthood with zero structural exposure to micro-savings patterns, debts or interests.',
    challenge2Name: 'Generational Cushion Gaps',
    challenge2Desc: 'Vulnerable community households start with 60% less equity-building resources or formal tools.',
    solutionTitle: 'Ledger For Kids Protocol',
    solutionBox1Title: 'Micro Saving Quests',
    solutionBox1Desc: 'Weave small daily chores or study micro-milestones into virtual parent-backed savings bonds.',
    solutionBox2Title: 'Sponsor Matching Grants',
    solutionBox2Desc: 'Partnered local community credit unions match completed savings levels dollar-for-dollar.',
    confidence: '94.5%',
    confidenceText: '94.5% - Educational High-Grade',
    image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'FINANCIAL RETENTION INDEX',
    metric1Value: '+140% Knowledge Gain',
    metric1Percent: 78,
    metric2Name: 'INTERACTION RETENTION',
    metric2Value: '95% Active Retention',
    metric2Percent: 95,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Hyperlocal Micro-Farming Hub': {
    title: 'Ecostead Organic Grid',
    tagline: 'Eradicating city food deserts through solar soil analysis, crop exchanges and peer-to-peer produce trades.',
    challenge1Name: 'Metropolitan Food Deserts',
    challenge1Desc: 'Over 2.5M urban families live in wards without access to fresh, organic grocery yield in a walk/transit bracket.',
    challenge2Name: 'Logistical Fuel Overhead',
    challenge2Desc: 'Imported vegetable yields discard up to 40% of their nutrient potential in interstate storage chains.',
    solutionTitle: 'Ecostead Decentralized Hub',
    solutionBox1Title: 'Ecostead Soil Assist',
    solutionBox1Desc: 'Automated garden bed companions analyze sunshine to outline perfect companion plant rotations.',
    solutionBox2Title: 'Direct Neighborhood Swap',
    solutionBox2Desc: 'A geo-fenced crop exchange matches excess garden yields with neighboring growers directly.',
    confidence: '95.1%',
    confidenceText: '95.1% - High Organic Yield',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'AVERAGE TRAVEL MILES',
    metric1Value: '99% CO2 Miles Avoided',
    metric1Percent: 99,
    metric2Name: 'COMMUNITY NUTRITION GAIN',
    metric2Value: '+80% Fresh Intake',
    metric2Percent: 80,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Adaptive Dyslexia Learning': {
    title: 'FontForge Neuro-Sanctuary',
    tagline: 'Adaptive letter contrast spacing, phonics frequencies, and customized learning blueprints for children.',
    challenge1Name: 'Extreme Cognitive Strains',
    challenge1Desc: 'Standard rigid sans-serif textbook print induces high dyslexia tracker slip and premature reading exhaustion.',
    challenge2Name: 'Classroom Disconnection',
    challenge2Desc: 'Frustrated readers lose up to 50% of psychological confidence relative to standard curricula peers.',
    solutionTitle: 'Adaptive Neural Reader',
    solutionBox1Title: 'Contrast Contrast Space',
    solutionBox1Desc: 'Instantly dynamically re-structures fonts to avoid visual letter flipping and physical crowding markers.',
    solutionBox2Title: 'Multisensory Phonics',
    solutionBox2Desc: 'Integrated pitch tracking associates syllables with unique acoustic pulses for audio memory aid.',
    confidence: '97.2%',
    confidenceText: '97.2% - Neurodiverse Friendly',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'READING SPEED GAINS',
    metric1Value: '+180% Faster Reading',
    metric1Percent: 90,
    metric2Name: 'ANXIETY DEPRECIATION',
    metric2Value: '-75% Testing Frustration',
    metric2Percent: 75,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Civic Food Waste Router': {
    title: 'SafeYield Surpluses Link',
    tagline: 'Redirecting retail grocery, restaurant, and household surpluses safely into regional community pantries.',
    challenge1Name: 'Food Inequality Levels',
    challenge1Desc: '30% of single parents experience food gaps weekly while retailers dump millions of tons of high-grade food.',
    challenge2Name: 'Landfill Decomposing Damage',
    challenge2Desc: 'Organic waste rotting in landfills produces up to 12% of devastating regional thermal methane gases.',
    solutionTitle: 'Zero Surplus Logistics',
    solutionBox1Title: 'Live Surge Matches',
    solutionBox1Desc: 'Partner grocery systems emit quick surplus alerts allowing close proximity volunteers to execute handovers.',
    solutionBox2Title: 'Prone Cold-Chain Ledger',
    solutionBox2Desc: 'Trace log sheets guarantee temperature safety checks to comply completely with local charity standards.',
    confidence: '93.6%',
    confidenceText: '93.6% - Operational Grade',
    image: 'https://images.unsplash.com/photo-1595273670150-db0d3bf36b5a?auto=format&fit=crop&q=80&w=600',
    metric1Name: 'MEAL QUANTITIES SAVED',
    metric1Value: '+45,000 Safe Meals',
    metric1Percent: 82,
    metric2Name: 'SURPLUS RETRIEVAL SCALE',
    metric2Value: '88% Clean Salvage',
    metric2Percent: 88,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  },
  'Anything (Random Global Idea)': {
    title: 'Ocean Re-Gen Protocol',
    tagline: 'An AI-orchestrated autonomous cleanup and restoration system for coastal ecosystems.',
    challenge1Name: 'Critical Degradation',
    challenge1Desc: '90% of local seagrass meadows have been lost due to micro-plastic saturation and temperature spikes.',
    challenge2Name: 'Economic Instability',
    challenge2Desc: 'Local artisanal fishing communities face 40% income reduction as biodiversity collapses.',
    solutionTitle: 'Re-Gen Protocol',
    solutionBox1Title: 'Swarm Autonomy',
    solutionBox1Desc: 'Solar-powered drones identify and collect micro-plastics via computer vision.',
    solutionBox2Title: 'Impact Tokens',
    solutionBox2Desc: 'Blockchain-verified carbon and plastic credits fund local restorers.',
    confidence: '94.2%',
    confidenceText: '94.2% - High Precision',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXu0NtdUJ8yiDdSLhBSm2AY65i5EJXfNnLjOxFaEpXG9LtLRgi32QZQclNoYyrtpMN01G0aiQlD6K6KDAoNdwZev3BtOb5JnMCcUy3aTFh4GFV4d1qtpd5f3RFNXy0NuYiUvxWQRUMTxanMz-q7WYaQLcOaDCRBLe3Bt2EZ3r9-vM2xjcHjAsNFVOqDldiqiUKKw1qby4giI0KLOT9hEe_kZJTWBTJoVnzRvUZJPOyt_H5M7XS4URJiXF-qgzbVCyn2fNfcn1DlwayE',
    metric1Name: 'CO2 SEQUESTRATION',
    metric1Value: '+12,000t',
    metric1Percent: 75,
    metric2Name: 'BIODIVERSITY INDEX',
    metric2Value: '+85%',
    metric2Percent: 85,
    mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
  }
};

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input Setup, 2: Idea Strategy Pitch, 3: Interactive Code Sandbox
  const [topic, setTopic] = useState<string>('Climate Change & Green Grid');
  const [freeText, setFreeText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // App state
  const [sessions, setSessions] = useState<IdeaSession[]>([]);
  const [activeSession, setActiveSession] = useState<IdeaSession | null>(null);
  
  // Real dynamic stats state
  const [globalStats, setGlobalStats] = useState<{
    totalIdeas: number;
    completedDemos: number;
    positiveImpact: number;
    countriesCount: number;
  }>({
    totalIdeas: 121,
    completedDemos: 14,
    positiveImpact: 8400,
    countriesCount: 45
  });
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Interaction states
  const [copied, setCopied] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showAuthAlertModal, setShowAuthAlertModal] = useState<boolean>(false);

  // Usage balance tracking states
  const [limitsInfo, setLimitsInfo] = useState<UserLimitInfo | null>(null);
  const [limitsLoading, setLimitsLoading] = useState<boolean>(true);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    packageName: string;
    amount: number;
    creditCount: number;
    stage: 'select' | 'processing' | 'success';
    chosenProvider: 'google_pay' | 'apple_pay' | null;
  } | null>(null);

  // Dynamic headers builder
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers['X-Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Helper to safely parse JSON responses to prevent JSON parse crashes on HTML error pages
  const safeJsonParse = async (response: Response, defaultErrorText: string = 'An unexpected server response occurred.') => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('JSON parsing failed. Raw response was:', text);
      return { error: `${defaultErrorText} Server returned a non-JSON response (Status ${response.status}).` };
    }
  };

  const fetchLimits = async () => {
    try {
      setLimitsLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/user/limits', { headers });
      if (res.ok) {
        const data = await safeJsonParse(res, 'Failed to parse usage/limit values.');
        if (data && !data.error) {
          setLimitsInfo(data);
        }
      }
    } catch (err) {
      console.error('Failed fetching usage/limit configs:', err);
    } finally {
      setLimitsLoading(false);
    }
  };

  const handleSimulatePayment = async (provider: 'google_pay' | 'apple_pay') => {
    if (!paymentModal || !currentUser) return;
    
    // Transition modal into processing
    setPaymentModal(prev => prev ? { ...prev, stage: 'processing', chosenProvider: provider } : null);
    
    // Simulate payment sequence bioconsent processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/user/pay', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: paymentModal.amount,
          creditCount: paymentModal.creditCount,
          provider: provider
        })
      });

      if (res.ok) {
        setPaymentModal(prev => prev ? { ...prev, stage: 'success' } : null);
        triggerToast('Paid successfully and limits upgraded!');
        fetchLimits();
      } else {
        const errData = await safeJsonParse(res, 'Payment validation failed.');
        triggerToast(`Payment validation failed: ${errData.error || 'Server error'}`);
        setPaymentModal(prev => prev ? { ...prev, stage: 'select', chosenProvider: null } : null);
      }
    } catch (err) {
      triggerToast('Local server payment verification error.');
      setPaymentModal(prev => prev ? { ...prev, stage: 'select', chosenProvider: null } : null);
    }
  };

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch histories and limit status when authentication stabilizes or changes
  useEffect(() => {
    if (!authLoading) {
      fetchHistory();
      fetchLimits();
      fetchGlobalStats();
    }
  }, [currentUser, authLoading]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/ideas/global-stats');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setGlobalStats(data);
        }
      }
    } catch (err) {
      console.error('Failed fetching global stats:', err);
    }
  };

  const handleLikeSession = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/ideas/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => {
          if (s._id === id) {
            return { ...s, likesCount: data.likesCount };
          }
          return s;
        }));
        if (activeSession && activeSession._id === id) {
          setActiveSession(prev => prev ? { ...prev, likesCount: data.likesCount } : null);
        }
        triggerToast('Gained +1 Positive Impact upvote!');
        fetchGlobalStats();
      }
    } catch (err) {
      console.error('Failed upvoting concept:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ideas/history', { headers });
      if (res.ok) {
        const data = await safeJsonParse(res, 'Failed to parse creation history.');
        if (data && Array.isArray(data)) {
          setSessions(data);
        }
      }
    } catch (err) {
      console.error('Failed fetching creation history:', err);
    }
  };

  const handleCreateIdea = async () => {
    if (!currentUser) {
      setShowAuthAlertModal(true);
      return;
    }

    if (!topic.trim()) {
      triggerToast('Please select or specify an application theme.');
      return;
    }

    setLoading(true);
    setLoadingStage('Analyzing global problem frameworks & drafting solution concept...');

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ 
          topic, 
          freeText, 
          model: selectedModel 
        })
      });

      if (!res.ok) {
        const errData = await safeJsonParse(res, 'Conceptualization fallback failed.');
        if (res.status === 403) {
          throw new Error('Registration Required. Please sign in or register with Google via the sidebar structure to unlock full generation quotas.');
        }
        throw new Error(errData.error || 'Server responded with an error during conceptualization.');
      }

      const data = await safeJsonParse(res, 'Conceptualization response parsing failed.');
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update session item tracking locally
      const mockSession: IdeaSession = {
        _id: data.sessionId,
        userId: currentUser?.uid || 'anonymous_user',
        userInput: { topic, freeTextPrompt: freeText },
        generatedIdea: data.idea,
        status: 'IDEA_GENERATED',
        generatedHtml: null,
        createdAt: new Date().toISOString()
      };
      
      setActiveSession(mockSession);
      setStep(2);
      fetchHistory();
      fetchLimits();
      fetchGlobalStats();
    } catch (err: any) {
      console.error(err);
      triggerToast(`Conceptualization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!currentUser) {
      setShowAuthAlertModal(true);
      return;
    }
    if (!activeSession) return;
    
    setLoading(true);
    setLoadingStage('Synthesizing pristine HTML layouts, compiling Tailwind wrappers, and injecting client-side simulation log scripts...');

    try {
      const res = await fetch('/api/ideas/generate-code', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          sessionId: activeSession._id,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errData = await safeJsonParse(res, 'Mockup synthesis fallback failed.');
        if (res.status === 403) {
          throw new Error('Registration Required. Please sign in or register with Google via the sidebar structure to unlock full generation quotas.');
        }
        throw new Error(errData.error || 'Syntax compiler failed during live template construction.');
      }

      const data = await safeJsonParse(res, 'Mockup synthesis response parsing failed.');
      if (data.error) {
        throw new Error(data.error);
      }
      
      const updatedSession: IdeaSession = {
        ...activeSession,
        generatedHtml: data.generatedHtml,
        status: 'COMPLETED'
      };

      setActiveSession(updatedSession);
      setPreviewTab('preview');
      setStep(3);
      fetchHistory();
      fetchLimits();
      fetchGlobalStats();
      triggerToast('Interactive desktop mockup compiled successfully!');
    } catch (err: any) {
      console.error(err);
      triggerToast(`Mockup synthesis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAnotherIdea = async () => {
    if (!currentUser) {
      setShowAuthAlertModal(true);
      return;
    }
    if (!activeSession) return;
    
    setLoading(true);
    setLoadingStage('Spinning up key concepts on this topic and formulating an alternative paradigm...');

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ 
          topic: activeSession.userInput.topic, 
          freeText: activeSession.userInput.freeTextPrompt || '', 
          model: selectedModel 
        })
      });

      if (!res.ok) {
        const errData = await safeJsonParse(res, 'Conceptualization fallback failed.');
        if (res.status === 403) {
          throw new Error('Registration Required. Please sign in or register with Google via the sidebar structure to unlock full generation quotas.');
        }
        throw new Error(errData.error || 'Server responded with an error during conceptualization.');
      }

      const data = await safeJsonParse(res, 'Conceptualization response parsing failed.');
      if (data.error) {
        throw new Error(data.error);
      }
      
      const mockSession: IdeaSession = {
        _id: data.sessionId,
        userId: currentUser?.uid || 'anonymous_user',
        userInput: { 
          topic: activeSession.userInput.topic, 
          freeTextPrompt: activeSession.userInput.freeTextPrompt || '' 
        },
        generatedIdea: data.idea,
        status: 'IDEA_GENERATED',
        generatedHtml: null,
        createdAt: new Date().toISOString()
      };
      
      setActiveSession(mockSession);
      setStep(2);
      fetchHistory();
      fetchLimits();
      fetchGlobalStats();
      triggerToast('Forged a new alternative concept paradigm!');
    } catch (err: any) {
      console.error(err);
      triggerToast(`Conceptualization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/ideas/${id}`, { 
        method: 'DELETE',
        headers: await getAuthHeaders()
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s._id !== id));
        if (activeSession?._id === id) {
          setActiveSession(null);
          setStep(1);
        }
        setDeletingSessionId(null);
        fetchLimits();
        fetchGlobalStats();
        triggerToast('History entry purged successfully.');
      }
    } catch (err) {
      console.error('Failed to prune session:', err);
      triggerToast('Error pruning record from local storage.');
    }
  };

  const handleCopyCode = () => {
    if (!activeSession?.generatedHtml) return;
    navigator.clipboard.writeText(activeSession.generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    triggerToast('Pristine application source code copied.');
  };

  const handleDownloadCode = () => {
    if (!activeSession?.generatedHtml) return;
    const blob = new Blob([activeSession.generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = activeSession.generatedIdea.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_+|_+$)/g, '');
    link.href = url;
    link.download = `${safeTitle || 'prototype'}_sandbox.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Prototype HTML downloaded successfully!');
  };

  const filteredSessions = sessions.filter(s => 
    s.generatedIdea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userInput.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#0F172A] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Toast Alert Indicator */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1E293B] text-slate-100 text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: History & Concept Hub */}
      <aside className="w-full md:w-80 bg-[#0B0F19] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-auto md:h-screen sticky top-0 shrink-0 select-none z-45">
        {/* Brand / Header info */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={() => {
              setStep(1);
              setActiveSession(null);
            }}
            className="flex items-center space-x-2.5 text-left cursor-pointer focus:outline-hidden hover:opacity-90 group transition active:scale-97"
            aria-label="Go to Main Dashboard"
          >
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-650/40 group-hover:from-indigo-500 group-hover:to-violet-500 transition-colors">
              <Sparkles className="h-5 w-5 text-indigo-100 fill-indigo-400/20 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Solve Tomorrow</span>
              </h1>
              <p className="text-[9.5px] text-indigo-400 font-semibold font-sans uppercase tracking-wider group-hover:text-indigo-300 transition-colors">Purpose Idea Generator</p>
            </div>
          </button>
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                // Auto-expand menu when entering settings on mobile
                if (!isMobileMenuOpen) setIsMobileMenuOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shadow-xs"
              title="Configure System Models"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Model settings dialog inline */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#0F172A] border-b border-slate-700 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Model Configuration</span>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-400">Dual-Agent AI Model Choice</label>
                  <div className="grid grid-cols-1 gap-1.5 align-middle">
                    <button
                      onClick={() => setSelectedModel('gemini-3.5-flash')}
                      className={`text-left p-2 rounded-lg text-xs border font-medium transition ${
                        selectedModel === 'gemini-3.5-flash' 
                          ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300' 
                          : 'border-slate-750 bg-slate-900/50 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-white">Gemini 3.5 Flash</div>
                      <div className="text-[10px] text-slate-455 font-normal">Super-fast concepting, free-tier optimized.</div>
                    </button>
                    <button
                      onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                      className={`text-left p-2 rounded-lg text-xs border font-medium transition ${
                        selectedModel === 'gemini-3.1-pro-preview' 
                          ? 'border-indigo-500 bg-indigo-600/10 text-indigo-300' 
                          : 'border-slate-750 bg-slate-900/50 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-white">Gemini 3.1 Pro (Preview)</div>
                      <div className="text-[10px] text-slate-455 font-normal">Complex template structures, requires Paid API token.</div>
                    </button>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-slate-800/80 my-1"></div>

                {/* Quota balance indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-semibold">
                    <span className="text-slate-400">Account Generations</span>
                    {limitsLoading ? (
                      <span className="animate-pulse text-indigo-400 font-mono text-[9px]">Syncing balance...</span>
                    ) : limitsInfo ? (
                      <span className="text-slate-200 font-mono">
                        {limitsInfo.generationsUsed} / {limitsInfo.maxGenerations} Used
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">-- / --</span>
                    )}
                  </div>

                  {limitsInfo && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            (limitsInfo.generationsUsed / limitsInfo.maxGenerations) >= 0.9 
                              ? 'bg-rose-500' 
                              : (limitsInfo.generationsUsed / limitsInfo.maxGenerations) >= 0.7 
                              ? 'bg-amber-400' 
                              : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${Math.min(100, (limitsInfo.generationsUsed / limitsInfo.maxGenerations) * 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-[9px] text-slate-400 font-medium font-mono">
                        <span>{Math.max(0, limitsInfo.maxGenerations - limitsInfo.generationsUsed)} remaining</span>
                        <span>{limitsInfo.isPremium ? '💎 Premium Upgraded' : '🌱 Free Tier'}</span>
                      </div>
                    </div>
                  )}

                  {/* Buy limits upgrades */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Buy Quota Upgrades</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      
                      {/* Pack 1 */}
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            triggerToast('Please sign in to Google to buy persistent account upgrades.');
                            return;
                          }
                          setPaymentModal({
                            isOpen: true,
                            packageName: 'Developer Boost Pack',
                            amount: 2.50,
                            creditCount: 50,
                            stage: 'select',
                            chosenProvider: null
                          });
                        }}
                        className="p-2 rounded-lg text-left bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition flex justify-between items-center cursor-pointer select-none"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-slate-200">Developer Booster</div>
                          <div className="text-[9px] text-slate-400 font-medium font-mono">+50 generations</div>
                        </div>
                        <div className="text-[10.5px] font-mono font-extrabold text-indigo-400">$2.50</div>
                      </button>

                      {/* Pack 2 */}
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            triggerToast('Please sign in to Google to buy persistent account upgrades.');
                            return;
                          }
                          setPaymentModal({
                            isOpen: true,
                            packageName: 'Creator Pro Bundle',
                            amount: 5.00,
                            creditCount: 150,
                            stage: 'select',
                            chosenProvider: null
                          });
                        }}
                        className="p-2 rounded-lg text-left bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition flex justify-between items-center cursor-pointer select-none"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-slate-200">Creator Pro Plan</div>
                          <div className="text-[9px] text-slate-400 font-medium font-mono">+150 generations</div>
                        </div>
                        <div className="text-[10.5px] font-mono font-extrabold text-indigo-400">$5.00</div>
                      </button>

                      {/* Pack 3 */}
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            triggerToast('Please sign in to Google to buy persistent account upgrades.');
                            return;
                          }
                          setPaymentModal({
                            isOpen: true,
                            packageName: 'Enterprise Power Pack',
                            amount: 10.00,
                            creditCount: 350,
                            stage: 'select',
                            chosenProvider: null
                          });
                        }}
                        className="p-2 rounded-lg text-left bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition flex justify-between items-center cursor-pointer select-none"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-slate-200">Enterprise Power Pack</div>
                          <div className="text-[9px] text-slate-400 font-medium font-mono">+350 generations</div>
                        </div>
                        <div className="text-[10.5px] font-mono font-extrabold text-indigo-400">$10.00</div>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Content Area */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-col flex-1 overflow-y-auto md:overflow-hidden h-auto md:h-full`}>
          {/* User Authentication Card */}
        <div className="p-4 border-b border-slate-700/60 bg-slate-900/15">
          {authLoading ? (
            <div className="flex items-center justify-center space-x-2 py-1">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-indigo-500 border-r-2 animate-pulse"></div>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight">Validating session...</span>
            </div>
          ) : currentUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 select-none">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {currentUser.displayName || 'Authorized User'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium font-mono truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await logOut();
                    triggerToast('Logged out successfully.');
                  } catch (e) {
                    triggerToast('Logout failed.');
                  }
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-350 hover:text-rose-450 transition cursor-pointer"
                title="Log Out of Account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-1">
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Sign in to save your generated concept blueprints and interactive prototypes:
              </p>
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    triggerToast('Signed in successfully!');
                  } catch (e: any) {
                    if (e.code === 'auth/popup-blocked') {
                      triggerToast('Popup was blocked by your browser.');
                    } else {
                      triggerToast('Google authentication failed.');
                    }
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* History Area */}
        <div className="p-4 flex flex-col flex-1 overflow-hidden h-64 md:h-full">
          <div className="relative mb-3.5">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-4 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900/55 placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2">
            <span className="flex items-center gap-1">
              <History className="h-3 w-3" />
              Creative Ledger
            </span>
            <span className="font-mono bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-750">{filteredSessions.length} sessions</span>
          </div>

          {/* History sessions scroll wrapper */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredSessions.map((item) => {
              const isActive = activeSession?._id === item._id;
              return (
                <div
                  key={item._id}
                  onClick={() => {
                    setActiveSession(item);
                    if (item.status === 'COMPLETED' && item.generatedHtml) {
                      setStep(3);
                    } else {
                      setStep(2);
                    }
                  }}
                  className={`group relative w-full text-left p-3 rounded-xl border transition cursor-pointer select-none ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-600/10 text-white' 
                      : 'border-slate-755 bg-slate-900/30 hover:bg-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 relative ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {item.userInput.topic}
                  </p>
                  <p className={`font-semibold text-xs truncate pr-6 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.generatedIdea.title}
                  </p>
                  
                  {/* Status pills inside list item */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-mono ${
                      (item.status === 'COMPLETED' && item.generatedHtml) 
                        ? (isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30') 
                        : (isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-950/40 text-amber-450 border border-amber-900/30')
                    }`}>
                      {(item.status === 'COMPLETED' && item.generatedHtml) ? 'LIVE DEMO' : 'BLUEPRINT'}
                    </span>
                    <span className="text-[8px] font-mono opacity-50 text-slate-450">
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {deletingSessionId === item._id ? (
                    <div className="absolute top-2 right-2 flex items-center bg-slate-950/90 rounded-lg p-1 border border-slate-700/60 shadow-lg z-10 gap-1.5 animate-fadeIn">
                      <span className="text-[9px] text-rose-400 font-bold px-1 select-none">Delete?</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(item._id, e);
                        }}
                        className="p-1 rounded bg-rose-600/25 hover:bg-rose-600 text-rose-400 hover:text-white transition cursor-pointer"
                        title="Yes, delete it"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingSessionId(null);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingSessionId(item._id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1 rounded-md transition opacity-0 group-hover:opacity-100 ${
                          isActive ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-450 hover:bg-slate-800'
                        }`}
                        title="Prune creation history record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="text-center py-10">
                <Globe className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs italic">No concepts logged under this search filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 md:p-6 border-t border-slate-750 text-[10px] text-slate-500 flex items-center justify-between font-mono mt-auto bg-slate-900/15">
          <span>Port 3000 Ingress</span>
          <span>Dual Agent Chain 1.2</span>
        </div>
      </div>
    </aside>

      {/* RIGHT MAIN CONTAINER: Modular Workspaces */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F172A] relative">
        
        {/* Registration Warning Web Alert Banner */}
        {!currentUser && !authLoading && (
          <div className="bg-amber-500/10 border-b border-amber-500/15 px-4 py-2.5 text-amber-200 flex items-center justify-between gap-3 text-xs shadow-md z-30 font-sans tracking-tight shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                <Info className="h-4 w-4" />
              </span>
              <div className="leading-relaxed">
                <span className="font-extrabold text-amber-350">Registration Alert: </span>
                You must register and sign in to generate custom concept blueprints, run prototype compilers, and save workspace histories.
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  triggerToast('Signed in successfully!');
                } catch (e: any) {
                  triggerToast('Google authentication failed.');
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg transition text-[10.5px] shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Dynamic global loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/95 backdrop-blur-md z-45 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative mb-6">
                <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 bg-indigo-400/20"></div>
                <div className="relative rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-3 text-white shadow-lg">
                  <Sparkles className="h-6 w-6 animate-spin duration-[3000ms]" />
                </div>
              </div>
              <p className="text-slate-200 font-semibold text-sm max-w-sm">{loadingStage}</p>
              <p className="text-slate-400 text-xs font-mono mt-2 animate-pulse">Running active LLM agent session pipelines...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: CONFIGURE APPS */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto bg-[#070A13] flex flex-col relative select-none selection:bg-indigo-500/30">
            {/* Glowing background auroras */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>



            {/* Main Interactive Landscaped Layout container */}
            <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-12 z-10 relative">

              {/* 1. HERO SECTION WITH LEFT DESCRIPTIONS AND RIGHT GLOWING GLASS BIO-ORB */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-radial from-[#0C1226] via-[#070A13] to-[#070A13] p-1 rounded-3xl animate-fadeIn">
                
                {/* Left side parameters & copywriting (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10.5px] font-extrabold text-indigo-300 uppercase tracking-widest leading-none">
                    <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                    <span>AI-Powered Idea Generator</span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
                      Small ideas.<br />
                      Big <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent underline decoration-indigo-500/30">impact.</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg font-light">
                      Create beautiful static webs or demos for global problems and social good. Turn dynamic empathy blueprints into live custom application simulations instantly.
                    </p>
                  </div>

                  {/* Interactive Option Directives Area */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 max-w-lg shadow-xl relative overflow-hidden backdrop-blur-md">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                          <Settings className="h-3.5 w-3.5" />
                        </span>
                        <div className="text-[10.5px] font-bold text-white uppercase tracking-wider">Custom Blueprint Directive</div>
                      </div>
                      <span className="text-[9px] text-[#89ceff] bg-[#001e2f] border border-sky-500/15 px-2 py-0.5 rounded font-mono">
                        Active preset: {topic.split(' ')[0]}
                      </span>
                    </div>

                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="e.g. Integrate carbon calculation metrics, simple visual chart models, responsive mobile screens..."
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed text-[11px]"
                    />

                    {/* Direct action run buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                      <button
                        onClick={handleCreateIdea}
                        className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-[0.98]"
                      >
                        <span>Get Started →</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          // Select random preset from presets
                          const randomPreset = TOPIC_PRESETS[Math.floor(Math.random() * (TOPIC_PRESETS.length - 1))];
                          setTopic(randomPreset.name);
                          triggerToast(`Switched active topic context to ${randomPreset.name}`);
                        }}
                        className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 rounded-xl text-xs font-bold transition cursor-pointer active:scale-[0.98]"
                      >
                        Explore Random Problem
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side Glowing Glass Bio-Sphere visual representation (5 cols) */}
                <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px]">
                  
                  {/* Glowing back lights */}
                  <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent animate-pulse duration-[5000ms]"></div>
                  
                  {/* The Glass Orb Sphere frame */}
                  <div className="relative w-72 h-72 rounded-full border border-indigo-500/25 shadow-2xl bg-slate-950/50 backdrop-blur-xl flex items-center justify-center overflow-hidden group select-none shadow-indigo-500/10">
                    
                    {/* Glass glare effect lines */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-45 h-45 bg-emerald-500/15 rounded-full blur-2xl animate-pulse"></div>

                    {/* Rich Unsplash beautiful seedling inside sphere representing positive growth ecosystem */}
                    <img
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400"
                      alt="Bioluminescent plant inside dome"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80 mix-blend-lighten scale-105 group-hover:scale-110 transition-transform duration-[6000ms]"
                    />

                    {/* Floating star particles inside */}
                    <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping pointer-events-none"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-indigo-300 rounded-full animate-pulse pointer-events-none"></div>
                    <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse pointer-events-none"></div>

                    {/* Bottom glass shadow highlight */}
                    <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-950 to-transparent"></div>
                  </div>

                  {/* Floating Stats Badges exact replication of the Solve Tomorrow inspiration */}
                  {/* Stats 1: Real Positive Impact Upvotes */}
                  <div className="absolute -top-3 left-6 scale-95 md:scale-100 bg-[#162032]/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl z-20 animate-bounce duration-[6000ms]">
                    <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 shrink-0">
                      <Leaf className="h-4 w-4 fill-emerald-500/10" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-white leading-none">
                        {(globalStats.positiveImpact / 1000).toFixed(2)}K
                      </p>
                      <p className="text-[8.5px] text-slate-450 font-medium font-sans">Positive Impact</p>
                    </div>
                  </div>

                  {/* Stats 2: Real Ideas Generated */}
                  <div className="absolute top-8 -right-3 scale-95 md:scale-100 bg-[#162032]/95 backdrop-blur-md border border-indigo-500/30 p-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl z-20">
                    <div className="bg-indigo-500/15 p-1.5 rounded-lg text-indigo-400 shrink-0">
                      <Sparkles className="h-4 w-4 fill-indigo-500/10" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-indigo-400 leading-none">
                        {globalStats.totalIdeas}
                      </p>
                      <p className="text-[8.5px] text-slate-450 font-medium font-sans animate-pulse">Ideas Generated</p>
                    </div>
                  </div>

                  {/* Stats 3: Real Countries/Topics Supported */}
                  <div className="absolute -bottom-4 right-10 scale-95 md:scale-100 bg-[#162032]/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl z-20">
                    <div className="bg-sky-500/10 p-1.5 rounded-lg text-sky-450 shrink-0">
                      <Globe className="h-4 w-4 text-sky-450" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-white leading-none">
                        {globalStats.countriesCount}
                      </p>
                      <p className="text-[8.5px] text-slate-450 font-medium font-sans">Global Presets</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* 2. THE PROBLEM PRESENTS CATEGORIES AREA */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="space-y-0.5">
                    <h2 className="text-md sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500 fill-pink-500/20" />
                      <span>Popular Problem Categories</span>
                    </h2>
                    <p className="text-slate-450 text-[11px] font-medium font-sans">
                      Select or click any categories below to instantly synchronize parameters and direct creative simulations.
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition">
                    View all preset nodes <ArrowRight className="h-3 w-3" />
                  </span>
                </div>

                {/* Popular categories layout grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TOPIC_PRESETS.map((p) => {
                    const isSelected = topic === p.name;
                    const isAnythingOption = p.name.includes("Anything");

                    // Set specific hardcoded count numbers for each preset to match Solve Tomorrow look
                    let countLabel = "12 ideas";
                    if (p.name.includes("Mental")) countLabel = "18 ideas";
                    if (p.name.includes("Financial")) countLabel = "15 ideas";
                    if (p.name.includes("Farming")) countLabel = "10 ideas";
                    if (p.name.includes("Dyslexia")) countLabel = "9 ideas";
                    if (p.name.includes("Waste")) countLabel = "11 ideas";
                    if (p.name.includes("Anything")) countLabel = "Infinite";

                    // Simple color themes for background icon bags
                    let iconBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                    let iconComp = <Leaf className="h-5 w-5" />;

                    if (p.name.includes("Mental")) {
                      iconBg = "bg-indigo-500/15 text-indigo-400 border-indigo-500/25";
                      iconComp = <Brain className="h-5 w-5" />;
                    } else if (p.name.includes("Financial")) {
                      iconBg = "bg-amber-500/15 text-amber-400 border-amber-500/25";
                      iconComp = <GraduationCap className="h-5 w-5" />;
                    } else if (p.name.includes("Farming")) {
                      iconBg = "bg-lime-500/15 text-lime-450 border-lime-500/25";
                      iconComp = <Sprout className="h-5 w-5" />;
                    } else if (p.name.includes("Dyslexia")) {
                      iconBg = "bg-rose-500/15 text-rose-450 border-rose-500/25";
                      iconComp = <Heart className="h-5 w-5 fill-rose-500/15" />;
                    } else if (p.name.includes("Waste")) {
                      iconBg = "bg-teal-500/15 text-teal-400 border-teal-500/25";
                      iconComp = <Recycle className="h-5 w-5" />;
                    } else if (p.name.includes("Anything")) {
                      iconBg = "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25 text-center";
                      iconComp = <Sparkles className="h-5 w-5" />;
                    }

                    return (
                      <div
                        key={p.name}
                        onClick={() => {
                          setTopic(p.name);
                          triggerToast(`Selected: ${p.name}`);
                        }}
                        className={`group/preset p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative flex flex-col justify-between min-h-[170px] ${
                          isSelected 
                            ? 'bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-950/20 ring-1 ring-indigo-500/25' 
                            : 'bg-[#0E1528]/85 border-slate-900 hover:border-slate-800 hover:bg-[#121B32]/90'
                        }`}
                      >
                        {/* Top Line: Iconic indicator bag + stats pill */}
                        <div className="flex justify-between items-start gap-4">
                          <div className={`p-2 rounded-xl border ${iconBg}`}>
                            {iconComp}
                          </div>
                          
                          <span className={`text-[9.5px] px-2.5 py-1 rounded-full font-bold font-sans tracking-wide border ${
                            isSelected 
                              ? 'bg-indigo-500 text-white border-indigo-400/20' 
                              : 'bg-slate-900/60 text-slate-400 border-slate-800'
                          }`}>
                            {countLabel}
                          </span>
                        </div>

                        {/* Title and descriptions block */}
                        <div className="space-y-1.5 mt-4">
                          <h4 className="text-[12.5px] font-extrabold text-white tracking-tight group-hover/preset:text-indigo-400 transition">
                            {p.name}
                          </h4>
                          <p className="text-[10.5px] text-slate-450 font-medium leading-relaxed font-sans mt-0.5">
                            {p.description}
                          </p>
                        </div>

                        {/* Purpose Quote display */}
                        <div className="border-t border-slate-900/70 pt-2.5 mt-3">
                          <p className="text-[9.5px] text-indigo-400/80 italic font-mono leading-tight">
                            “{p.impactQuote}”
                          </p>
                        </div>

                        {/* Selected Indicator overlay details */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-500 p-0.5 rounded-full text-white shadow-md">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: CONCEPTUAL SOLUTION DETAILS (ROADMAP) */}
        {step === 2 && activeSession && (() => {
          const gen = activeSession.generatedIdea;
          const currentData = {
            title: gen.title,
            tagline: gen.problemStatement,
            challenge1Name: gen.challenge1Name || 'Critical Bottleneck',
            challenge1Desc: gen.challenge1Desc || gen.problemStatement,
            challenge2Name: gen.challenge2Name || 'Socioeconomic Threat',
            challenge2Desc: gen.challenge2Desc || `Requires localized system implementation optimized for ${activeSession.userInput.topic}.`,
            confidence: gen.confidence || '94.8%',
            confidenceText: gen.confidenceText || '94.8% Operational Rating',
            solutionTitle: gen.solutionTitle || 'Dynamic Mitigator',
            solutionBox1Title: gen.solutionBox1Title || 'Strategic Processing Engine',
            solutionBox1Desc: gen.solutionBox1Desc || gen.proposedSolution,
            solutionBox2Title: gen.solutionBox2Title || 'Demonstrational Logic Node',
            solutionBox2Desc: gen.solutionBox2Desc || gen.coreFeatures[0] || 'Fully functional prototype mockup.',
            image: BLUEPRINT_DATA[activeSession.userInput.topic]?.image || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400',
            metric1Name: gen.metric1Name || 'ESTIMATED REACH',
            metric1Value: gen.metric1Value || '+85% Reach',
            metric1Percent: gen.metric1Percent || 85,
            metric2Name: gen.metric2Name || 'STRATEGIC CONFIDENCE',
            metric2Value: gen.metric2Value || '92.4% Score',
            metric2Percent: gen.metric2Percent || 92,
            mapImage: BLUEPRINT_DATA[activeSession.userInput.topic]?.mapImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjtdqaczTMNtMQKEfx92SENJGAYK1m-xhrX9OWChpDjHIwmyucl3lzY3GdBsp9_FLxYOU6Rxf0oDuBHwOX6ZwmWLPFnJpejC5k9BxAPiQ4K4z9ZXp7Q-w_OpkgdF6YyUsDympHM2juV953e0a4ucuhrX13IxKSGiEM0y5KzF7TZw9Z1lJwnYwEtGt3Ww3bdENFXpRBHsBvZ89ysYgtcIBS-UBAFJ-pANM0_Wgb8IcI39wsi_ACLbuWPluFAWRDjTI2zY-lGDjYD8'
          };

          return (
            <div className="flex-1 overflow-y-auto bg-[#070A13] flex flex-col relative select-none selection:bg-indigo-500/30">
              {/* Glowing background auroras */}
              <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
              <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

              {/* Main Interactive Landscaped Layout container */}
              <div className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8 z-10 relative">

                {/* Dynamic Header */}
                <header className="mb-4 text-center relative pt-4 select-none animate-fadeIn">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none select-none">
                    <Globe className="h-44 w-44 text-[#d2bbff] animate-pulse" />
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#d2bbff]/10 border border-[#d2bbff]/20 text-[#d2bbff] px-4 py-1.5 rounded-full mb-3 shadow-[0_0_15px_rgba(210,187,255,0.05)]">
                    <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-pulse"></span>
                    <span className="font-semibold text-[10px] uppercase tracking-wider">Forge Complete: Blueprint Ready</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 font-sans mt-1">
                    {currentData.title}
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans leading-relaxed">
                    {currentData.tagline}
                  </p>
                </header>

                {/* Blueprint Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 animate-fadeIn">
                  
                  {/* Column 1: The Challenge */}
                  <section className="bg-[#171f33]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-between lg:col-span-2 shadow-xl">
                    <div>
                      <h3 className="text-sm font-bold text-[#89ceff] mb-4 flex items-center gap-2 uppercase tracking-wider font-sans">
                        <Info className="h-4 w-4 text-amber-500" />
                        The Challenge
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#2d3449]/40 border-l-4 border-rose-500/60 space-y-1 overflow-y-auto max-h-72">
                          <p className="text-[10px] font-black text-[#ffb4ab] uppercase tracking-wider">Critical Bottleneck</p>
                          <p className="text-xs text-slate-350 leading-relaxed font-bold">{currentData.challenge1Name}</p>
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-1">{currentData.challenge1Desc}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Column 2: The Solution (Hero Section) */}
                  <section className="bg-[#171f33]/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col pointer-events-auto h-[520px] relative overflow-hidden group lg:col-span-3 shadow-xl">
                    <div className="absolute inset-0 z-0 select-none">
                      <img 
                        className="w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition-all duration-[2000ms]" 
                        referrerPolicy="no-referrer"
                        src={currentData.image} 
                        alt={currentData.title}
                      />
                    </div>
                    <div className="relative z-10 p-6 flex flex-col h-full gap-4 overflow-y-auto">
                      {/* Brand Title & Tagline Header inside Solution Box */}
                      <div className="space-y-1.5 pb-2.5 border-b border-white/5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none">
                          <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                          <span>Dynamic Solution Schema</span>
                        </span>
                        <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight leading-tight">
                          {currentData.title}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                          {currentData.tagline}
                        </p>
                      </div>

                      <h3 className="text-xs font-bold text-[#d2bbff] uppercase tracking-wider font-sans mt-1">
                        Deployment Protocol: {currentData.solutionTitle}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#171f33]/60 backdrop-blur-md p-4 rounded-xl border border-white/5 space-y-1.5">
                          <div className="p-1 max-w-fit rounded bg-[#7c3aed]/10 text-[#d2bbff]">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{currentData.solutionBox1Title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{currentData.solutionBox1Desc}</p>
                        </div>
                        <div className="bg-[#171f33]/60 backdrop-blur-md p-4 rounded-xl border border-white/5 space-y-1.5">
                          <div className="p-1 max-w-fit rounded bg-[#7c3aed]/10 text-[#d2bbff]">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{currentData.solutionBox2Title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{currentData.solutionBox2Desc}</p>
                        </div>
                      </div>

                      {/* Info on features to demonstrate */}
                      <div className="bg-[#171f33]/50 border border-slate-800 rounded-xl p-3 space-y-2 mt-1">
                        <p className="text-[10px] font-black text-[#d2bbff] uppercase tracking-wider">Features to Demonstrate:</p>
                        <ul className="space-y-1 list-disc pl-4 text-[10.5px] text-slate-350">
                          {activeSession.generatedIdea.coreFeatures.map((f, i) => (
                            <li key={i} className="leading-tight truncate">{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-[#d2bbff]/5 border border-[#d2bbff]/10 p-3.5 rounded-xl gap-4">
                          <div className="text-center sm:text-left">
                            <p className="text-[9px] font-bold text-[#d2bbff] tracking-widest uppercase">EXPECTED VIABILITY</p>
                            <p className="text-md font-extrabold text-white">High Alpha Version</p>
                          </div>
                          <button 
                            onClick={handleGenerateCode}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#7c3aed] to-fuchsia-600 text-[#ede0ff] px-6 py-2.5 rounded-lg text-xs font-black animate-pulse hover:shadow-[0_0_20px_rgba(210,187,255,0.3)] hover:brightness-110 transition-all duration-300 transform active:scale-95 text-center shrink-0"
                          >
                            EXECUTE BLUEPRINT →
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Column 3: Blueprint Actions & Controls */}
                  <section className="bg-[#171f33]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col lg:col-span-2 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-[#b3d17a] mb-6 flex items-center gap-2 uppercase tracking-wider font-sans border-b border-white/5 pb-3">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      Blueprint Actions
                    </h3>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      {/* ACTION ONE: Synthesize / Build Web */}
                      <div className="space-y-1.5">
                        <p className="text-[9.5px]/none text-slate-400 uppercase font-black tracking-widest">PRIMARY ACTION</p>
                        <button
                          onClick={handleGenerateCode}
                          className="w-full relative group/btn flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 active:scale-[0.98] rounded-xl text-white font-extrabold text-xs transition duration-200 shadow-lg shadow-indigo-500/10 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            <span className="p-1.5 bg-white/15 rounded-lg shrink-0">
                              <Code2 className="h-3.5 w-3.5 text-white" />
                            </span>
                            <div>
                              <span className="block text-white font-extrabold text-[11px] uppercase tracking-wider leading-none">Generate Web App</span>
                              <span className="block text-[8.5px] text-indigo-200 font-normal mt-1 leading-none">Compile fully interactive demo</span>
                            </div>
                          </div>
                          <span className="p-1 bg-white/10 rounded-md group-hover/btn:translate-x-1 transition-transform shrink-0">
                            <ArrowRight className="h-3 w-3 text-white" />
                          </span>
                        </button>
                      </div>

                      {/* ACTION TWO: Try another concept */}
                      <div className="space-y-1.5">
                        <p className="text-[9.5px]/none text-slate-400 uppercase font-black tracking-widest">RE-CONCEPTUALIZE</p>
                        <button
                          onClick={handleTryAnotherIdea}
                          className="w-full flex items-center justify-between p-4 bg-[#141a29] border border-white/10 hover:border-indigo-500/30 hover:bg-[#1b2338] active:scale-[0.98] rounded-xl text-slate-200 font-semibold text-xs transition duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            <span className="p-1.5 bg-slate-800 rounded-lg text-indigo-400 shrink-0">
                              <RotateCcw className="h-3.5 w-3.5 animate-spin-slow" />
                            </span>
                            <div>
                              <span className="block font-extrabold text-[11px] text-white uppercase tracking-wider leading-none">Alternative Concept</span>
                              <span className="block text-[8.5px] text-slate-400 font-normal mt-1 leading-none">Roll new variables on this topic</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* ACTION THREE: Clipboard share */}
                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Title: ${currentData.title}\n\nProblem Context: ${currentData.tagline}\n\nFirst Bottleneck: ${currentData.challenge1Name} - ${currentData.challenge1Desc}\n\nProposed Protocol: ${currentData.solutionTitle}`);
                            triggerToast('Blueprint parameters copied to clipboard!');
                          }}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 hover:bg-slate-900 active:scale-[0.98] rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Copy Blueprint Manifesto</span>
                          </div>
                          <span className="text-[9px] text-[#b3d17a] font-mono">Ready</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer live feedback notification card */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <div className="bg-[#0b1326] p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3d17a] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b3d17a]"></span>
                        </span>
                        <p className="text-[10.5px] font-sans text-[#b3d17a] font-medium tracking-wide">Live concept simulator feedback active</p>
                      </div>
                    </div>
                  </section>

                </div>

              </div>
            </div>
          );
        })()}

        {/* STEP 3: PREVIEW ENVIRONMENT & CODE SANDBOX */}
        {step === 3 && activeSession && (
          <div className="flex-1 flex flex-col h-full bg-[#0F172A] select-none">
            
            {/* Top Toolbar */}
            <div className="border-b border-slate-700/80 px-4 sm:px-6 py-2.5 sm:py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 shrink-0 bg-[#0F172A]">
              
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight line-clamp-1">
                    {activeSession.generatedIdea.title}
                  </h2>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Globe className="h-2.5 w-2.5" />
                  <span>Sandboxed interactive prototype</span>
                </p>
              </div>

              {/* Render Modes Selectors */}
              <div className="flex items-center space-x-2.5">
                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-0.5 flex">
                  <button 
                    onClick={() => setPreviewTab('preview')}
                    className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition ${previewTab === 'preview' ? 'bg-slate-850 text-white shadow-sm border border-slate-700/40' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Interactive Tab
                  </button>
                  <button 
                    onClick={() => setPreviewTab('code')}
                    className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition ${previewTab === 'code' ? 'bg-slate-850 text-white shadow-sm border border-slate-700/40' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    HTML Source
                  </button>
                </div>

                {/* Desktop/Mobile Simulator wrapper toggle */}
                {previewTab === 'preview' && (
                  <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-0.5 flex">
                    <button
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1 rounded-md transition ${viewportMode === 'desktop' ? 'bg-slate-850 text-white border border-slate-700/40' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Desktop Framework"
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1 rounded-md transition ${viewportMode === 'mobile' ? 'bg-slate-850 text-white border border-slate-700/40' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Mobile Device Port"
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Download / Actions */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <button
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-[10.5px] sm:text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Generate New</span>
                </button>
                
                <button
                  onClick={handleDownloadCode}
                  className="flex-1 md:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10.5px] sm:text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Code</span>
                </button>
              </div>

            </div>

            {/* TAB CONTENT: Preview Viewport Wrapper or Rich Code Editor */}
            <div className="flex-1 bg-slate-900/50 relative p-3 sm:p-6 overflow-hidden flex flex-col">
              
              {previewTab === 'preview' ? (
                /* Interactive Preview Mode */
                <div className="flex-1 flex justify-center items-center h-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 flex flex-col bg-white border border-slate-750/30 shadow-2xl overflow-hidden ${
                      viewportMode === 'mobile' 
                        ? 'sm:w-[375px] w-full sm:max-w-full rounded-2xl sm:rounded-[40px] p-0 sm:p-3 sm:border-[8px] sm:border-slate-800 bg-white sm:bg-[#1E293B] sm:ring-4 sm:ring-slate-800 shadow-2xl relative' 
                        : 'w-full rounded-2xl overflow-hidden'
                    }`}
                  >
                    {/* Device Status Bar Mock for Mobile Viewport */}
                    {viewportMode === 'mobile' && (
                      <div className="hidden sm:flex justify-between items-center px-6 py-2.5 text-[10px] text-slate-400 font-bold select-none font-sans bg-[#1E293B] rounded-t-3xl">
                        <span>09:41</span>
                        <div className="w-20 h-4 bg-slate-805 rounded-full shrink-0"></div>
                        <div className="flex items-center space-x-1">
                          <span className="w-3 h-2 bg-slate-500 rounded-xs inline-block"></span>
                          <span className="w-2.5 h-2 bg-slate-400 rounded-xs inline-block"></span>
                        </div>
                      </div>
                    )}

                    {/* True Virtual Sandboxed Frame container */}
                    <div className="flex-1 relative bg-white rounded-b-xl">
                      {activeSession.generatedHtml ? (
                        <iframe
                          srcDoc={activeSession.generatedHtml}
                          title={`${activeSession.generatedIdea.title} Sandbox`}
                          className="w-full h-full border-none rounded-b-xl"
                          sandbox="allow-scripts"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-4">
                          <X className="h-8 w-8 text-rose-500 mb-2 animate-pulse" />
                          <p className="text-slate-300 font-semibold text-xs">Sandbox Pipeline Interrupted</p>
                          <p className="text-slate-500 text-[10px] mt-1">Please try re-generating or check parameters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Static Text / HTML Copy code view tab */
                <div className="flex-1 flex flex-col border border-slate-700 rounded-2xl bg-slate-900 shadow-2xl overflow-hidden self-stretch relative">
                  
                  {/* Code Tool bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950 font-mono text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-indigo-400" />
                      {activeSession.generatedIdea.title.toLowerCase().replace(/\s+/g, '_')}_sandbox.html
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 rounded text-slate-300 hover:text-white transition border border-slate-800"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pre container for HTML text render */}
                  <div className="flex-1 overflow-auto p-4 select-text">
                    <pre className="text-xs font-mono text-emerald-400 leading-relaxed text-left selection:bg-indigo-700 selection:text-white">
                      <code>{activeSession.generatedHtml}</code>
                    </pre>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Global Simulated Google Pay & Apple Pay Modal Sheet */}
        <AnimatePresence>
          {paymentModal && paymentModal.isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-705 bg-radial from-slate-900 via-slate-950 to-slate-900 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl relative"
              >
                {/* Close Button unless processing */}
                {paymentModal.stage !== 'processing' && (
                  <button 
                    onClick={() => setPaymentModal(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/85 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {paymentModal.stage === 'select' && (
                  <div className="p-6 space-y-4">
                    <div className="text-center space-y-1 pt-1.5">
                      <div className="text-indigo-400 bg-indigo-500/10 p-2.5 rounded-2xl inline-block mb-1 shadow-inner shadow-indigo-500/5">
                        <Sparkles className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">Upgrade Quota Limits</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans px-2">
                        Get additional high-fidelity, dual-agent prototypes powered by your developer API key resources.
                      </p>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Pack selected</p>
                        <p className="text-xs font-bold text-white mt-0.5">{paymentModal.packageName}</p>
                        <p className="text-[10px] text-indigo-400 font-medium mt-0.5 font-mono">+{paymentModal.creditCount} generations allowance</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 font-semibold font-mono">Price</p>
                        <p className="text-base font-extrabold text-white font-mono mt-0.5">${paymentModal.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Choose Apple / Google Pay */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono text-center mb-1.5">Select instant checkout</p>
                      
                      {/* Apple Pay Button */}
                      <button
                        onClick={() => handleSimulatePayment('apple_pay')}
                        className="w-full h-11 bg-black hover:bg-neutral-900 border border-neutral-800 text-white rounded-xl flex items-center justify-center gap-1.5 transition font-medium text-xs cursor-pointer select-none active:scale-[0.985]"
                      >
                        <span className="font-mono text-sm">🍎</span>
                        <span className="font-sans font-bold tracking-tight text-white mb-0.25">Pay with Apple Pay</span>
                      </button>

                      {/* Google Pay Button */}
                      <button
                        onClick={() => handleSimulatePayment('google_pay')}
                        className="w-full h-11 bg-white hover:bg-neutral-100 text-slate-900 rounded-xl flex items-center justify-center gap-2 transition font-medium text-xs cursor-pointer select-none active:scale-[0.985]"
                      >
                        <svg className="h-4 w-auto" viewBox="0 0 40 16" fill="none">
                          <path d="M6.1 1.7C4.1 3.7 2.9 6.4 2.9 9.3c0 2.9 1.2 5.6 3.2 7.6l-2.1 2C1.5 16.3 0 13 0 9.3C0 5.6 1.5 2.3 4 0l2.1 1.7z" fill="#EA4335" />
                          <path d="M12.9 14C11.5 15.4 9.4 16 7.4 15.5l-0.5-2.2c1.3 0.3 2.7-0.1 3.6-1.1c1.3-1.3 1.3-3.4 0-4.7C9.7 6.6 8.3 6.1 7 6.4L6.5 4.2c2-0.5 4.1 0.1 5.5 1.5c2 1.9 2 5.1 0.9 8.3z" fill="#4285F4" />
                          <path d="M14 9.3c0-3.7 1.5-7 4-9.3l2.1 2C18.1 3.7 16.9 6.4 16.9 9.3c0 2.9 1.2 5.6 3.2 7.6l-2.1 2c-2.5-2.6-4-5.9-4-9.6z" fill="#FBBC05" fillOpacity="0.9" />
                          <path d="M25.4 1.7C23.4 3.7 22.2 6.4 22.2 9.3c0 2.9 1.2 5.6 3.2 7.6l-2.1 2C20.8 16.3 19.3 13 19.3 9.3C19.3 5.6 20.8 2.3 23.3 0l2.1 1.7z" fill="#34A853" />
                        </svg>
                        <span className="font-sans font-bold tracking-tight text-neutral-800">Pay with Google Pay</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] text-slate-500 pt-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Verified Sandbox Protocol Active</span>
                    </div>
                  </div>
                )}

                {paymentModal.stage === 'processing' && (
                  <div className="p-8 text-center space-y-6">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/10 mb-4"></div>
                      <h3 className="text-sm font-extrabold text-white tracking-tight">Authorizing Checkout</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold text-center leading-relaxed">
                        Handshaking with {paymentModal.chosenProvider === 'apple_pay' ? 'Apple Pay Secure Enclave' : 'Google Pay Credentials'}...
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 text-[9.5px] font-mono leading-relaxed">
                      <div className="flex justify-between text-indigo-400">
                        <span>✓ Secure Client Encryption</span>
                        <span>Established</span>
                      </div>
                      <div className="flex justify-between text-indigo-400">
                        <span>✓ Bioconsent Token Scan</span>
                        <span>Verified</span>
                      </div>
                      <div className="flex justify-between text-indigo-300 animate-pulse">
                        <span>▶ Syncing allowance on server...</span>
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentModal.stage === 'success' && (
                  <div className="p-6 text-center space-y-5">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl inline-block mb-3 animate-bounce">
                        <Check className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">Upgrade Executed!</h3>
                      <p className="text-[11px] text-slate-400 mt-1 px-4 leading-normal">
                        Your account limit has been successfully verified and upgraded by <span className="text-emerald-400 font-extrabold">+{paymentModal.creditCount} generations</span>!
                      </p>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 text-left font-mono text-[9.5px] leading-normal space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Checkout Method:</span>
                        <span className="text-slate-200">{paymentModal.chosenProvider === 'apple_pay' ? '🍎 Apple Pay' : '💳 Google Pay'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price Logged:</span>
                        <span className="text-slate-200 font-bold">${paymentModal.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Generations Allocated:</span>
                        <span className="text-emerald-400 font-bold">+{paymentModal.creditCount} Creations</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentModal(null)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition"
                    >
                      Close Setup
                    </button>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Registration Required Web Alert Modal */}
        <AnimatePresence>
          {showAuthAlertModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-slate-900 border border-slate-800 bg-radial from-slate-900 via-slate-950 to-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowAuthAlertModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/85 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="p-6 md:p-8 space-y-5 text-center">
                  <div className="text-amber-400 bg-amber-500/10 p-3 rounded-2xl inline-block shadow-inner">
                    <LogIn className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-white">Registration Required</h3>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans px-2">
                       You must register and sign in to get additional free generation quotas, build interactive app scripts, and save progress histories safely!
                    </p>
                  </div>

                  {/* Quick Action Google Register */}
                  <button
                    onClick={async () => {
                      try {
                        setShowAuthAlertModal(false);
                        await signInWithGoogle();
                        triggerToast('Signed in successfully!');
                      } catch (e: any) {
                        triggerToast('Google authentication failed.');
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-95"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Register / Sign In with Google</span>
                  </button>

                  <button
                    onClick={() => setShowAuthAlertModal(false)}
                    className="w-full py-2 text-slate-450 hover:text-slate-200 rounded-xl transition text-[11px] font-semibold cursor-pointer"
                  >
                    Dismiss and Explore Sandbox
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
