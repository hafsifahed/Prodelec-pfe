import { IsOptional, IsString } from "class-validator";
import { User } from "../../users/entities/users.entity";

export class UpdatePartnerDto {
      @IsOptional()
      id: number;
      
      @IsString()
      @IsOptional()
      name: string;
    
      @IsString()
      @IsOptional()
      address: string;
    
      @IsString()
      @IsOptional()
      tel: string;
    
      @IsString()
      @IsOptional()
      image?: string;

    @IsOptional()
    users: User[];
}
