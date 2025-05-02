import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';

class PermissionDto {
  @IsString()
  resource: Resource;

  @ArrayNotEmpty()
  @IsString({ each: true })
  actions: Action[];
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
