import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Create a new role with permissions.
   * @param dto CreateRoleDto containing role name and permissions
   * @returns The created Role entity
   */
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create({
      name: dto.name,
      permissions: dto.permissions,
    });

    return this.roleRepository.save(role);
  }

  /**
   * Find a role by its ID.
   * @param roleId The ID of the role
   * @returns The Role entity
   * @throws NotFoundException if role not found
   */
  async getRoleById(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role;
  }
}
