import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';

@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  create(@Body() createAvisDto: CreateAvisDto) {
    return this.avisService.create(createAvisDto);
  }

  @Get()
  findAll() {
    return this.avisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avisService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAvisDto: UpdateAvisDto) {
    return this.avisService.update(+id, updateAvisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avisService.remove(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.avisService.findByUser(+userId);
  }
}
