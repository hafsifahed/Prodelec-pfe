import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { AccountStatusDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions({ resource: Resource.users, actions: [Action.create] })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('by')
  @Permissions({ resource: Resource.users, actions: [Action.create] })
  async createBy(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createBy(createUserDto);
  }

  @Get()
  @Permissions({ resource: Resource.users, actions: [Action.read] })
  async findMany(@Query() query: FindUsersDto) {
    return this.usersService.findMany(query);
  }

  @Get('byid/:id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Get('nameprofile')
  getNameProfile(@CurrentUser() user: User) {
    return this.usersService.getNameProfile(user.id);
  }

  @Get('profilepermession')
  getPermesionProfile(@CurrentUser() user: User) {
    return user;
  }


  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }

  // Admin-only: Update a user's role
  @Patch(':id/role')
  @Permissions({ resource: Resource.users, actions: [Action.update] })
  async updateRole(
    @Param('id') id: string,
    @Body('roleId') roleId: number,
    @CurrentUser() user: User,
  ) {
    // Example: simple admin check based on role name
    if (user.role.name !== 'admin') {
      throw new ForbiddenException('You are not authorized to update roles');
    }
    return this.usersService.updateRole(+id, roleId);
  }

  @Patch(':id/status')
@Permissions({ resource: Resource.users, actions: [Action.update] })
async updateStatus(
  @Param('id') id: string,
  @Body() dto: AccountStatusDto
) {
  return this.usersService.updateAccountStatus(+id, dto.status);
}

@Patch(':id')
@Permissions({ resource: Resource.users, actions: [Action.update] })
async updateUser(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto
) {
  return this.usersService.updateUser(+id, dto);
}

@Get('search')
@Permissions({ resource: Resource.users, actions: [Action.read] })
async searchUsers(@Query('q') keyword: string) {
  return this.usersService.searchUsers(keyword);
}

@Patch(':id/set-password')
@UseGuards(JwtAuthGuard)//AdminGuard
async setPassword(
  @Param('id') userId: string,
  @Body() dto: SetPasswordDto
) {
  await this.usersService.setPassword(+userId, dto);
  return { message: 'Password updated successfully' };
}

/* admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.user.role.name === 'ADMIN'; // Adjust based on your role system
  }
}*/

  @Delete(':id')
  @Permissions({ resource: Resource.users, actions: [Action.delete] })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}


  

