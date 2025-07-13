import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';

import { AccountStatusDto } from './dto/account-status.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdateUserFullDto } from './dto/update-user-full.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  private readonly BASE_DIRECTORY = path.join(require('os').homedir(), 'Downloads', 'uploads', 'users');

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions({ resource: Resource.USERS, actions: [Action.CREATE, Action.MANAGE] })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('by')
  @Permissions({ resource: Resource.USERS, actions: [Action.CREATE, Action.MANAGE] })
  async createBy(@Body() createUserDto: CreateUserDto) {
    console.log("image",createUserDto.image)
    return this.usersService.createBy(createUserDto);
  }

  @Get()
  @Permissions({ resource: Resource.USERS, actions: [Action.READ, Action.MANAGE] })
  async findMany(@Query() query: FindUsersDto) {
    return this.usersService.findMany(query);
  }

  @Get('all')
  @Permissions({ resource: Resource.USERS, actions: [Action.READ, Action.MANAGE] })
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('byid/:id')
  @Permissions({ resource: Resource.USERS, actions: [Action.READ, Action.MANAGE] })
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

  @Patch(':id/role')
  @Permissions({ resource: Resource.USERS, actions: [Action.UPDATE, Action.MANAGE] })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('roleId') roleId: number,
    @CurrentUser() user: User,
  ) {
    if (user.role.name !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update roles');
    }
    return this.usersService.updateRole(id, roleId);
  }

  @Patch(':id/status')
  @Permissions({ resource: Resource.USERS, actions: [Action.UPDATE, Action.MANAGE] })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AccountStatusDto,
  ) {
    return this.usersService.updateAccountStatus(id, dto.status);
  }

  @Patch(':id')
  @Permissions({ resource: Resource.USERS, actions: [Action.UPDATE, Action.MANAGE] })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Get('search')
  @Permissions({ resource: Resource.USERS, actions: [Action.READ, Action.MANAGE] })
  async searchUsers(@Query('q') keyword: string) {
    return this.usersService.searchUsers(keyword);
  }

  @Patch(':id/set-password')
  @Permissions({ resource: Resource.USERS, actions: [Action.UPDATE, Action.MANAGE] })
  async setPassword(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: SetPasswordDto,
  ) {
    await this.usersService.setPassword(userId, dto);
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @Permissions({ resource: Resource.USERS, actions: [Action.DELETE, Action.MANAGE] })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.deleteUser(id);
  }

  @Patch(':id/full')
  @Permissions({ resource: Resource.USERS, actions: [Action.UPDATE, Action.MANAGE] })
  async updateUserFull(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserFullDto,
  ) {
    return this.usersService.updateUserFull(id, dto);
  }

  @Get('stats/users-sessions')
  async getStats() {
    return this.usersService.getUserAndSessionStats();
  }

  @Get('roles/client')
  async getClientRoles() {
    return this.usersService.getClientRoles();
  }

  @Get('roles/worker')
  async getWorkerRoles() {
    return this.usersService.getWorkerRoles();
  }

  @Get('workers')
  async getWorkers(): Promise<User[]> {
    return this.usersService.findWorkers();
  }

  @Get('clients')
  async getClients(): Promise<User[]> {
    return this.usersService.findClients();
  }

  // Upload image utilisateur optionnelle
 @Post('upload-image')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        const userDir = path.join(
          require('os').homedir(),
          'Downloads',
          'uploads',
          'users',
          'ProfileImages',
        );
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 8 * 1024 * 1024 },
  }),
)
async uploadImage(
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() user: User,
) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  const username = user.username;
  const relativePath = path.relative(
    path.join(require('os').homedir(), 'Downloads', 'uploads', 'users'),
    file.path,
  ).split(path.sep).join('/');

  return {
    filename: file.filename,
    url: `/uploads/users/ProfileImages/${file.filename}`,
    path: file.path,
  };
}

}
