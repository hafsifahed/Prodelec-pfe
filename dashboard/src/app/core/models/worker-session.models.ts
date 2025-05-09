import {WorkerModel} from "./worker.models";

export class WorkerSessionModels {
    id: number;
    workermail: string;
    worker: WorkerModel;
    sessionStart: Date;
    sessionEnd: Date;
    ipAddress: string;
    createdAt: string;
    updatedAt: string;
}