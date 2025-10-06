import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UnauthorizedException,
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
import { UsersService } from '../users/users.service';
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
        private readonly userService: UsersService,

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

  @Get('archive/user')
async getArchiveForCurrentUser(@CurrentUser() user: User) {
  return this.service.getArchiveByUserRole(user);
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
async findByUser(@Param('userId', ParseIntPipe) userId: number) {
  // Assuming you have a UserService injected
  const user = await this.userService.findOneById(userId);
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return this.service.getCahierDesChargesByUser(user);
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
  archiver(@Param('id') id: number,  @CurrentUser() user: User) {
    // Exemple rôle accessible à user.role.name
  if (!user || !user.role || !user.role.name) {
    throw new UnauthorizedException('Non authentifié');
  }

  if (user.role.name.toUpperCase().startsWith('CLIENT')) {
    return this.service.archiverU(id);
  } else {
    return this.service.archiver(id);
  }
  }

  @Put('restorer/:id')
  restorer(@Param('id') id: number) {
    return this.service.restorer(id);
  }

  @Put('archiverU/:id')
  archiverU(@Param('id') id: number,  @CurrentUser() user: User) {
    // Exemple rôle accessible à user.role.name
  if (!user || !user.role || !user.role.name) {
    throw new UnauthorizedException('Non authentifié');
  }

  if (user.role.name.toUpperCase().startsWith('CLIENT')) {
    return this.service.archiverU(id);
  } else {
    return this.service.archiver(id);
  }
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

  // Construire le template HTML complet
  const htmlTemplate = this.buildEmailTemplate(emailRequest.subject, emailRequest.text);

  for (const recipient of emailRequest.to) {
    await this.mailerService.sendMail({
      to: recipient,
      from: 'hafsifahed98@gmail.com',
      subject: emailRequest.subject,
      html: htmlTemplate,
    });
  }
  return { message: 'Emails envoyés' };
}

private buildEmailTemplate(subject: string, message: string, senderName?: string): string {
  const currentYear = new Date().getFullYear();
  const senderInfo = senderName ? `<p><strong>Expéditeur:</strong> ${senderName}</p>` : '';

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8f9fa;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #2c5aa0;
        padding-bottom: 20px;
        margin-bottom: 25px;
      }
      .header img {
        height: 60px;
        margin-bottom: 15px;
      }
      .content {
        padding: 0 10px;
        line-height: 1.6;
      }
      .content h1 {
        color: #2c5aa0;
        margin-top: 0;
        font-size: 24px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #666;
        padding-top: 25px;
        margin-top: 25px;
        border-top: 1px solid #e0e0e0;
      }
      .message-content {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #2c5aa0;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://www.prodelecna.com/wp-content/uploads/2021/12/logo-PRODELEC.png" alt="Logo Prodelec">
      </div>
      <div class="content">
        <h1>${subject}</h1>
        ${senderInfo}
        <div class="message-content">
          ${message}
        </div>
      </div>
      <div class="footer">
        <p><strong>Prodelec NA</strong> &copy; ${currentYear}</p>
        <p style="font-size: 12px; color: #888;">
          Cet email a été envoyé via le système de messagerie Prodelec
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
  

   @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: number) {
    await this.service.removeFile(fileId);
    return { message: 'Fichier supprimé avec succès' };
  }
   @Put('incomplete/:id')
  async markAsIncomplete(
    @Param('id') id: number,
    @Body('commentaire') commentaire: string,
  ): Promise<CahierDesCharges> {
    return this.service.markAsIncomplete(id, commentaire);
  }
}
