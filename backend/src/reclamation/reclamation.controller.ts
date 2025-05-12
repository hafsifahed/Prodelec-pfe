// src/reclamation/reclamation.controller.ts
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { ProcessReclamationDto } from './dto/process-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { Reclamation } from './entities/reclamation.entity';
import { ReclamationService } from './reclamation.service';

@Controller('reclamation')
@UseGuards(JwtAuthGuard)
export class ReclamationController {
  private readonly BASE_DIRECTORY = path.join(require('os').homedir(), 'Downloads', 'uploads');

  constructor(private readonly reclamationService: ReclamationService) {}

  @Post()
async create(
  @Body() createReclamationDto: CreateReclamationDto,
  @CurrentUser() user: User,
) {
  return this.reclamationService.create(createReclamationDto, user);
}

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReclamationDto: UpdateReclamationDto,
  ) {
    return this.reclamationService.update(+id, updateReclamationDto);
  }

  @Get()
  findAll(): Promise<Reclamation[]> {
    return this.reclamationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Reclamation> {
    return this.reclamationService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Reclamation[]> {
    return this.reclamationService.findByUser(+userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.reclamationService.delete(+id);
  }

  @Put('traiter/:id')
  async processReclamation(
    @Param('id') id: string,
    @Body() processDto: ProcessReclamationDto,
  ) {
    return this.reclamationService.processReclamation(+id, processDto.reponse);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const username = user.username;
    const userDir = path.join(this.BASE_DIRECTORY, username, 'Reclamations');

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Sanitize filename and prepend timestamp to avoid collisions
    const timestamp = Date.now();
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeFilename}`;
    const filePath = path.join(userDir, filename);

    // Save file buffer to disk
    fs.writeFileSync(filePath, file.buffer);

    return { filename, path: filePath };
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const userDir = path.join(this.BASE_DIRECTORY, user.username, 'Reclamations');
    const filePath = path.join(userDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Detect MIME type for proper Content-Type header
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  }
}