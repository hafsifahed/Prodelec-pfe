import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() project: Project) {
    return this.projectService.create(project);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() project: Partial<Project>) {
    return this.projectService.update(id, project);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.projectService.remove(id);
  }
}
