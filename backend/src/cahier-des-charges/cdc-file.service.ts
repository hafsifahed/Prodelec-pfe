import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CdcFile } from './entities/cdc-file.entity';

@Injectable()
export class CdcFileService {
  constructor(
    @InjectRepository(CdcFile)
    private readonly repository: Repository<CdcFile>,
  ) {}

  async createFile(nomFichier: string, chemin: string, cdcId: number): Promise<CdcFile> {
    const file = this.repository.create({
      nomFichier,
      chemin,
      cahierDesCharges: { id: cdcId } as any,
    });
    return this.repository.save(file);
  }

  async deleteFile(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getFilesByCdcId(cdcId: number): Promise<CdcFile[]> {
    return this.repository.find({
      where: { cahierDesCharges: { id: cdcId } },
      order: { id: 'ASC' },
    });
  }
}
