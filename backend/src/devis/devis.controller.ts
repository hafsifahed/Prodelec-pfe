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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { DevisService } from './devis.service';
import { Devis } from './entities/devi.entity';
const BASE_DIRECTORY = join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', 'uploads', 'Devis');

@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!existsSync(BASE_DIRECTORY)) mkdirSync(BASE_DIRECTORY, { recursive: true });
          cb(null, BASE_DIRECTORY);
        },
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { filename: file.originalname };
  }

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = join(BASE_DIRECTORY, fileName);
    if (!existsSync(filePath)) throw new NotFoundException('File not found');
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` });
    createReadStream(filePath).pipe(res);
  }

  @Get('pdf/:fileName')
  async servePDF(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = join(BASE_DIRECTORY, fileName);
    if (!existsSync(filePath)) throw new NotFoundException('File not found');
    res.set({ 'Content-Type': 'application/pdf' });
    createReadStream(filePath).pipe(res);
  }

  @Get()
  getAllDevis(): Promise<Devis[]> {
    return this.devisService.findAll();
  }

  @Get('user/:userId')
  getDevisByUser(@Param('userId') userId: number): Promise<Devis[]> {
    return this.devisService.findByUser({ id: userId } as any);
  }

  @Get(':id')
  getDevisById(@Param('id') id: number): Promise<Devis> {
    return this.devisService.getDevisById(id);
  }

@Post(':cahierDesChargesId')
saveDevis(
  @Param('cahierDesChargesId') cdcId: number,
  @Body() body: { pieceJointe: string; numdevis: string }
): Promise<Devis> {
  if (!body?.pieceJointe) throw new BadRequestException('pieceJointe is required');
  if (!body?.numdevis) throw new BadRequestException('numdevis is required');
  return this.devisService.saveDevis(cdcId, body.pieceJointe, body.numdevis);
}


  @Put('accept/:id')
  acceptDevis(@Param('id') id: number): Promise<Devis> {
    return this.devisService.acceptDevis(id);
  }

  @Put('refuse/:id')
  refuseDevis(@Param('id') id: number, @Body() body: { commentaire: string }): Promise<Devis> {
    if (!body?.commentaire) throw new BadRequestException('commentaire is required');
    return this.devisService.refuseDevis(id, body.commentaire);
  }

  @Put('archiver/:id')
  archiver(@Param('id') id: number): Promise<Devis> {
    return this.devisService.archiver(id);
  }

  @Put('restorer/:id')
  restorer(@Param('id') id: number): Promise<Devis> {
    return this.devisService.restorer(id);
  }

  @Put('archiverU/:id')
  archiverU(@Param('id') id: number): Promise<Devis> {
    return this.devisService.archiverU(id);
  }

  @Put('restorerU/:id')
  restorerU(@Param('id') id: number): Promise<Devis> {
    return this.devisService.restorerU(id);
  }

  @Delete(':id')
  deleteDevis(@Param('id') id: number): Promise<void> {
    return this.devisService.deleteDevis(id);
  }
}
