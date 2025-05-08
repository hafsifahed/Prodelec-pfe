import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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
  @Permissions({ resource: Resource.partners, actions: [Action.read] })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: Resource.partners, actions: [Action.read] })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(+id);
  }

  @Post()
  @Permissions({ resource: Resource.partners, actions: [Action.create] })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Put(':id')
  @Permissions({ resource: Resource.partners, actions: [Action.update] })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnersService.update(+id, updatePartnerDto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.partners, actions: [Action.delete] })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(+id);
  }

  // Custom endpoints
  @Get(':id/partner')
  @Permissions({ resource: Resource.partners, actions: [Action.read] })
  getPartnerByUserId(@Param('id') id: string) {
    return this.partnersService.getPartnerByUserId(+id);
  }

  @Get(':id/usersp')
  @Permissions({ resource: Resource.partners, actions: [Action.read] })
  getUsersByPartnerId(@Param('id') id: string) {
    return this.partnersService.getUsersByPartnerId(+id);
  }
}
