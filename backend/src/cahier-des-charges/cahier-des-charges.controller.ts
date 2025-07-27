import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { CahierDesChargesService } from './cahier-des-charges.service';
import { CreateCahierDesChargesDto } from './dto/create-cahier-des-charge.dto';
import { EmailRequestDto } from './dto/email-request.dto';
import { CahierDesCharges } from './entities/cahier-des-charge.entity';

@Controller('cdc')
@UseGuards(JwtAuthGuard)
export class CahierDesChargesController {
  static BASE_DIRECTORY = join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', 'uploads');

  constructor(
    private readonly service: CahierDesChargesService,
    private readonly mailerService: MailerService,
  ) {}

 // ------------------ UPLOAD MULTIPLE FILES ------------------------
  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tempDir = join(CahierDesChargesController.BASE_DIRECTORY, 'temp');
          if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('username') username: string,
    @Body('cdcId') cdcId: number,
    @CurrentUser() currentUser: User,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');

    if (username !== currentUser.username) {
      throw new BadRequestException('Username mismatch');
    }

    const results = [];
    const userDir = join(CahierDesChargesController.BASE_DIRECTORY, username, 'Cahier des charges');
    if (!existsSync(userDir)) mkdirSync(userDir, { recursive: true });

    for (const file of files) {
      const tempPath = file.path;
      const targetPath = join(userDir, file.filename);
      fs.renameSync(tempPath, targetPath);

      if (cdcId) {
        // Stocker uniquement le nom du fichier (file.filename) en BDD
        const savedFile = await this.service.addFileToCdc(cdcId, file.filename, currentUser.username);
        results.push(savedFile);
      } else {
        results.push({ filename: file.filename });
      }
    }

    return results;
  }

  // ------------------ CRUD et autres méthodes inchangées ----------------------
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

  // ------------------ DOWNLOAD ----------------------
  @Get('download/:fileName')
async downloadFile(
  @Param('fileName') fileName: string,
  @Query('username') username: string,
  @Res() res: Response,
) {
  const userDir = join(CahierDesChargesController.BASE_DIRECTORY, username, 'Cahier des charges');
  const filePath = join(userDir, fileName);

  if (!existsSync(filePath)) throw new NotFoundException('Fichier non trouvé');
  
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });
  createReadStream(filePath).pipe(res);
}


  // ------------- PDF preview -------------------
  @Get('pdf/:fileName')
  async servePDF(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = join(CahierDesChargesController.BASE_DIRECTORY, fileName);
    if (!existsSync(filePath)) throw new NotFoundException('Fichier non trouvé');
    res.set({ 'Content-Type': 'application/pdf' });
    createReadStream(filePath).pipe(res);
  }

  // ------------------ EMAIL ----------------------
  @Post('send')
  async sendEmail(@Body() emailRequest: EmailRequestDto) {
    if (!emailRequest.to || !Array.isArray(emailRequest.to)) {
      throw new BadRequestException('Le champ "to" doit être un tableau d\'emails');
    }

    for (const recipient of emailRequest.to) {
      await this.mailerService.sendMail({
        to: recipient,
        from: 'hafsifahed98@gmail.com',
        subject: emailRequest.subject,
        html: emailRequest.text,
      });
    }
    return { message: 'Emails envoyés' };
  }
}
