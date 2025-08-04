// workflow-message.model.ts
export interface WorkflowMessage {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  type: 'message' | 'system_event';
  createdAt: Date;
}