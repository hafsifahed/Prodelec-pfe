import { WorkflowPhase } from "../entities/workflow-discussion.entity";

export interface WorkflowDiscussionSidebar {
  id: number;
  currentPhase: WorkflowPhase;
  createdAt: Date;
  
  cdc: {
    id: number;
    titre: string;
  };
  
  devis?: {
    id: number;
    numdevis: string;
  };
  
  orders?: Array<{
    idOrder: number;
    orderName: string;
  }>;
  
  projects?: Array<{
    idproject: number;
    refClient: string;
  }>;
  
  lastMessage?: {
    id: number;
    content: string;
    author: {
      id: number;
      firstName: string;
      lastName: string;
    };
    createdAt: Date;
  };
}