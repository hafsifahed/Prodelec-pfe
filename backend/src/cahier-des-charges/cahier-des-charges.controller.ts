import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post, Put,
  Query, Res,
  UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';
import { CahierDesChargesService } from './cahier-des-charges.service';
import { CreateCahierDesChargesDto } from './dto/create-cahier-des-charge.dto';
import { EmailRequestDto } from './dto/email-request.dto';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';

@Controller('cdc')
export class CahierDesChargesController {
  constructor(
    private readonly service: CahierDesChargesService,
    private readonly mailerService: MailerService,
  ) {}

  static BASE_DIRECTORY = join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', 'uploads');

  // UPLOAD
  @Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const tempDir = join(CahierDesChargesController.BASE_DIRECTORY, 'temp');
      if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  })
}))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body('username') username: string,
  @CurrentUser() currentUser: User,
) {
  if (!file) throw new BadRequestException('No file uploaded');
  if (username !== currentUser.username) {
    throw new BadRequestException('Username mismatch');
  }
  const fs = require('fs');
  const path = require('path');

  const userDir = join(CahierDesChargesController.BASE_DIRECTORY, username, 'Cahier des charges');
  if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });

  const tempPath = file.path;
  const targetPath = path.join(userDir, file.originalname);

  fs.renameSync(tempPath, targetPath);

  return { filename: file.originalname };
}



  // CRUD
  @Get()
  findAll(): Promise<CahierDesCharges[]> {
    return this.service.getAllCahierDesCharges();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<CahierDesCharges> {
    return this.service.getCahierDesChargesById(id);
  }

     @Post()
  async create(@Body() dto: CreateCahierDesChargesDto): Promise<CahierDesCharges> {
    return this.service.saveCahierDesCharges(dto);
  }


  @Put()
  update(@Body() cdc: CahierDesCharges): Promise<CahierDesCharges> {
    return this.service.updateCahierDesCharges(cdc);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.deleteCahierDesCharges(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.service.getCahierDesChargesByUser({ id: userId } as any);
  }

  @Put('accept/:id')
  accept(@Param('id') id: number) {
    return this.service.acceptCahierDesCharges(id);
  }

  @Put('refuse/:id')
  refuse(@Param('id') id: number, @Body('commentaire') commentaire: string) {
    return this.service.refuseCahierDesCharges(id, commentaire);
  }

  @Put('archiver/:id')
  archiver(@Param('id') id: number) {
    return this.service.archiver(id);
  }

  @Put('restorer/:id')
  restorer(@Param('id') id: number) {
    return this.service.restorer(id);
  }

  @Put('archiverU/:id')
  archiverU(@Param('id') id: number) {
    return this.service.archiverU(id);
  }

  @Put('restorerU/:id')
  restorerU(@Param('id') id: number) {
    return this.service.restorerU(id);
  }

  // DOWNLOAD (PDF or any file)
  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Query('email') email: string,
    @Res() res: Response
  ) {
    const userDir = join(CahierDesChargesController.BASE_DIRECTORY, email, 'Cahier des charges');
    const filePath = join(userDir, fileName);

    if (!existsSync(filePath)) throw new NotFoundException('Fichier non trouvé');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`
    });
    createReadStream(filePath).pipe(res);
  }

  // PDF Preview
  @Get('pdf/:fileName')
  async servePDF(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = join(CahierDesChargesController.BASE_DIRECTORY, fileName);
    if (!existsSync(filePath)) throw new NotFoundException('Fichier non trouvé');
    res.set({ 'Content-Type': 'application/pdf' });
    createReadStream(filePath).pipe(res);
  }

  // ENVOI EMAIL
  @Post('send')
  async sendEmail(@Body() emailRequest: EmailRequestDto) {
    for (const recipient of emailRequest.to) {
      await this.mailerService.sendMail({
        to: recipient,
        from: 'noreply@prodelecna.com',
        subject: emailRequest.subject,
        html: emailRequest.text,
      });
    }
    return { message: 'Emails envoyés' };
  }
}
