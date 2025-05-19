import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Action } from '../enums/action.enum';
import { Resource } from '../enums/resource.enum';

class PermissionDto {
  @IsEnum(Resource)
  resource: Resource;

  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(Action, { each: true })
  actions: Action[];
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];

  @IsBoolean()
  @IsOptional()
  isSystemRole?: boolean;
}
