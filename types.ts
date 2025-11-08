
export enum AppStep {
  InitialForm,
  Conversation,
  Documents,
}

export interface ProjectDetails {
  idea: string;
  projectType: string;
  audience: string;
  goal: string;
  techStack: string;
}

export enum ChatRole {
    USER = 'user',
    MODEL = 'model',
}

export interface ChatMessage {
    role: ChatRole;
    text: string;
}

export interface GeneratedDocs {
    techspec: string;
    plan: string;
    gemini: string;
}
