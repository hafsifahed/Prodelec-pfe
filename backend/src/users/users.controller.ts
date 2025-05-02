import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // createUserDto should include roleId (number)
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findMany(@Query() query: FindUsersDto) {
    return this.usersService.findMany(query);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
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

  
}
