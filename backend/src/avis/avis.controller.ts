import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvisService } from './avis.service';
import { CreateAvisDto } from './dto/create-avis.dto';
import { UpdateAvisDto } from './dto/update-avis.dto';

@Controller('avis')
@UseGuards(JwtAuthGuard)
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

  @Get('partner/:partnerId')
findByPartner(@Param('partnerId') partnerId: string) {
  return this.avisService.findByPartner(+partnerId);
}

 @Get('has-old-avis/:userId')
  async hasOldAvis(@Param('userId') userId: string) {
    return this.avisService.hasOldAvis(+userId);
  }

}
