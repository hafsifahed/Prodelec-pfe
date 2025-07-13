import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/partners',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() createPartnerDto: CreatePartnerDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      createPartnerDto.image = file.filename;
    }
    return this.partnersService.create(createPartnerDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/partners',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      updatePartnerDto.image = file.filename;
    }
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.DELETE,Action.MANAGE] })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.remove(id);
  }

  // Custom endpoints
  @Get(':id/partner')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  getPartnerByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getPartnerByUserId(id);
  }

  @Get(':id/usersp')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  getUsersByPartnerId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getUsersByPartnerId(id);
  }

  @Patch(':id/inactivate')
@Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] })
async inactivatePartner(@Param('id', ParseIntPipe) id: number) {
  return this.partnersService.inactivatePartner(id);
}

@Patch(':id/activate')
@Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] })
async activatePartner(@Param('id', ParseIntPipe) id: number) {
  return this.partnersService.activatePartner(id);
}
}
