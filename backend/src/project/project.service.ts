import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(project: Project): Promise<Project> {
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['order', 'conceptionResponsible', 'methodeResponsible', 'productionResponsible', 'finalControlResponsible', 'deliveryResponsible'] });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { idproject: id }, relations: ['order', 'conceptionResponsible', 'methodeResponsible', 'productionResponsible', 'finalControlResponsible', 'deliveryResponsible'] });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: number, updateData: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
