import { WorkflowPhase } from "./workflow-phase.model";

export interface WorkflowDiscussionSidebar {
  id: number;
  currentPhase: WorkflowPhase;
  createdAt: Date;
  
  cdc: {
    id: number;
    titre: string;
  } | null;
  
  devis?: {
    id: number;
    numdevis: string;
  } | null;
  
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
            read: boolean; // Ajouter ce champ

  } | null;
      unreadCount: number; // Nouveau champ pour le nombre de messages non lus

}

