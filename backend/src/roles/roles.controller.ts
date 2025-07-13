import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateRoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Action } from './enums/action.enum';
import { Resource } from './enums/resource.enum';
import { RolesService } from './roles.service';
@UseGuards(JwtAuthGuard,PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions({ resource: Resource.ROLES, actions: [Action.MANAGE] })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Put(':id')
  @Permissions({ resource: Resource.ROLES, actions: [Action.MANAGE] })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.ROLES, actions: [Action.MANAGE] })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
