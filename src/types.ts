export interface UserInput {
  topic: string;
  freeTextPrompt: string;
}

export interface GeneratedIdea {
  title: string;
  problemStatement: string;
  proposedSolution: string;
  coreFeatures: string[];
  
  // Custom Dynamic Blueprint Fields
  challenge1Name?: string;
  challenge1Desc?: string;
  challenge2Name?: string;
  challenge2Desc?: string;
  solutionTitle?: string;
  solutionBox1Title?: string;
  solutionBox1Desc?: string;
  solutionBox2Title?: string;
  solutionBox2Desc?: string;
  confidence?: string;
  confidenceText?: string;
  metric1Name?: string;
  metric1Value?: string;
  metric1Percent?: number;
  metric2Name?: string;
  metric2Value?: string;
  metric2Percent?: number;
}

export interface IdeaSession {
  _id: string;
  userId?: string;
  userInput: UserInput;
  generatedIdea: GeneratedIdea;
  status: 'IDEA_GENERATED' | 'CODE_GENERATING' | 'COMPLETED' | 'REJECTED';
  generatedHtml: string | null;
  createdAt: string;
  likesCount?: number;
}

export interface UserLimitInfo {
  userId: string;
  generationsUsed: number;
  maxGenerations: number;
  isPremium: boolean;
  freeLimit: number;
  additionalGenerations: number;
  totalPaid: number;
}

