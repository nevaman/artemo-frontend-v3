
export type ToolCategory = 
  | 'AD_COPY' 
  | 'CLIENT_MANAGEMENT' 
  | 'COPY_IMPROVEMENT' 
  | 'EMAIL_COPY' 
  | 'LONG_FORM' 
  | 'OTHER_FLOWS' 
  | 'PODCAST_TOOLS' 
  | 'SALES_FUNNEL_COPY';

export interface Tool {
  id: string;
  title: string;
  category: ToolCategory;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  tags: ToolCategory[];
}

export type View = 
  | 'dashboard-view' 
  | 'tool-interface-view' 
  | 'all-tools-view'
  | 'all-projects-view' 
  | 'history-view' 
  | 'client-management-view' 
  | 'copy-improvement-view' 
  | 'ad-copy-view' 
  | 'email-copy-view' 
  | 'long-form-view' 
  | 'podcast-tools-view' 
  | 'sales-funnel-copy-view' 
  | 'other-flows-view'
  | 'admin-dashboard'
  | 'admin-categories'
  | 'admin-tools'
  | 'admin-users';

export interface ToolQuestion {
    label: string;
    type: 'input' | 'textarea';
    placeholder: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  active: boolean;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface AdminTool {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  active: boolean;
  featured: boolean;
  primaryModel: string;
  fallbackModels: string[];
  promptInstructions: string;
  questions: AdminToolQuestion[];
  knowledgeBaseFile?: {
    name: string;
    url: string;
    size: number;
  };
}

export interface AdminToolQuestion {
  id: string;
  label: string;
  type: 'input' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[]; // for select type
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  file?: {
    name: string;
    size: number;
  };
}

export interface ChatHistoryItem {
  id: string;
  toolId: string;
  toolTitle: string;
  messages: Message[];
  timestamp: number;
  projectId?: string;
}

export interface ToolScript {
  initialMessage: string;
  questions: string[];
  finalResponseGenerator: (toolTitle: string, answers: string[]) => string;
}

// Enhanced types for dynamic tool system
export interface DynamicTool extends Tool {
  active: boolean;
  featured: boolean;
  primaryModel: string;
  fallbackModels: string[];
  promptInstructions: string;
  questions: AdminToolQuestion[];
  knowledgeBaseFile?: {
    name: string;
    url: string;
    size: number;
  };
}

export interface ChatSession {
  id: string;
  toolId: string;
  currentQuestionIndex: number;
  answers: string[];
  isComplete: boolean;
  knowledgeBaseContext?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ToolsApiResponse extends ApiResponse<DynamicTool[]> {}
export interface CategoriesApiResponse extends ApiResponse<AdminCategory[]> {}