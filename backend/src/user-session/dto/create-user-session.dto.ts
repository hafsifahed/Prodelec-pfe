export class CreateUserSessionDto {
    usermail: string;
    ipAddress: string;
    userId?: number; // Optional: to link with User entity
  }
  