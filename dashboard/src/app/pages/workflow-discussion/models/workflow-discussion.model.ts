// workflow-discussion.model.ts
import { User } from "src/app/core/models/auth.models";
import { WorkflowMessage } from "./workflow-message.model";
import { Order } from "src/app/core/models/order/order";

export interface WorkflowDiscussion {
  id: number;
  cdc: {
    id: number;
    titre: string;
    etat: string;
    createdAt: Date | string;
    user: User;
  };
  devis?: {
    id: number;
    numdevis: string;
    etat: string;
    dateCreation: Date | string;
    user: User;
  };
  orders?: Array<{
    idOrder: number;
    orderName: string;
    createdAt: Date | string;
    user: User;
  }>;
  projects?: Array<{
    idproject: number;
    refClient: string;
    progress: number;
    createdAt: Date | string;
    order: Order;
    user: User;
  }>;
  currentPhase: 'cdc' | 'devis' | 'order' | 'project';
  createdAt: Date | string;
  messages: WorkflowMessage[];
}