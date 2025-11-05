export interface Task {
  id: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: number;
  comments?: number;
  assignee?: string; // Initials or name for avatar
  aiGeneratedPrompt?: string; // AI-generated prompt for Claude Code
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color: string; // Now used for icon color only
  icon?: string; // Emoji or icon name
  createdAt: Date;
}

export interface KanbanState {
  tasks: Record<string, Task>;
  columns: Column[];
}
