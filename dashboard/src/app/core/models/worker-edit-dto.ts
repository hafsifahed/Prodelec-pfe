// worker.model.ts
import {WorkerSessionModels} from "./worker-session.models";

export class WorkerEditDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password:string;
    role: string;
    workerSessions:WorkerSessionModels[];


}