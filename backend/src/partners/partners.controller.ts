import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { User } from '../users/entities/users.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PartnersController {
  private readonly PARTNERS_UPLOAD_BASE_DIRECTORY = path.join(
    require('os').homedir(),
    'Downloads',
    'uploads',
    'partners',
  );

  private readonly PARTNERS_PROFILE_IMAGES_DIRECTORY = path.join(
    this.PARTNERS_UPLOAD_BASE_DIRECTORY,
    'ProfileImages',
  );

  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ, Action.MANAGE] })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ, Action.MANAGE] })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.findOne(id);
  }

  @Post()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.CREATE, Action.MANAGE] })
  async create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Put(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE, Action.MANAGE] })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.DELETE, Action.MANAGE] })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.remove(id);
  }

  @Get(':partnerId/usersp')
  async getUsersByPartnerId(
    @Param('partnerId', ParseIntPipe) partnerId: number,
  ): Promise<User[]> {
    return this.partnersService.getUsersByPartnerId(partnerId);
  }

  @Patch(':id/inactivate')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE, Action.MANAGE] })
  async inactivatePartner(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.inactivatePartner(id);
  }

  @Patch(':id/activate')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE, Action.MANAGE] })
  async activatePartner(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.activatePartner(id);
  }

  // Upload image endpoint
  @Post('upload-image')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.CREATE, Action.UPDATE, Action.MANAGE] })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const partnerDir = path.join(
            require('os').homedir(),
            'Downloads',
            'uploads',
            'partners',
            'ProfileImages',
          );
          if (!fs.existsSync(partnerDir)) {
            fs.mkdirSync(partnerDir, { recursive: true });
          }
          cb(null, partnerDir);
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
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Calcul du chemin relatif pour accès frontend (avec slash unix)
    const relativePath = path.relative(
      path.join(require('os').homedir(), 'Downloads', 'uploads', 'partners'),
      file.path,
    ).split(path.sep).join('/');

    return {
      filename: file.filename,
      url: `/uploads/partners/${relativePath}`,
      path: file.path,
    };
  }
}
