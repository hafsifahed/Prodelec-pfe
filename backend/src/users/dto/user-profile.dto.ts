import { Permission } from "../../roles/dto/role.dto";
import { AccountStatus } from "../enums/account-status.enum";

export class UserProfileDto {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    accountStatus: AccountStatus;
    createdAt: Date;
    role: {
      id: number;
      name: string;
      permissions: Permission[];
    };
  }
  