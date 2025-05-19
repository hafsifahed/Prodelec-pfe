import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ] })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ] })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.findOne(id);
  }

  @Post()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.CREATE] })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Put(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE] })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.DELETE] })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.remove(id);
  }

  // Custom endpoints
  @Get(':id/partner')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ] })
  getPartnerByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getPartnerByUserId(id);
  }

  @Get(':id/usersp')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ] })
  getUsersByPartnerId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getUsersByPartnerId(id);
  }
}
