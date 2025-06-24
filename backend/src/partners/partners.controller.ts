import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@Controller('partners')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.findOne(id);
  }

  @Post()
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.CREATE,Action.MANAGE] })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Put(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.DELETE,Action.MANAGE] })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.remove(id);
  }

  // Custom endpoints
  @Get(':id/partner')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  getPartnerByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getPartnerByUserId(id);
  }

  @Get(':id/usersp')
  @Permissions({ resource: Resource.PARTNERS, actions: [Action.READ,Action.MANAGE] })
  getUsersByPartnerId(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getUsersByPartnerId(id);
  }

  @Patch(':id/inactivate')
@Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] })
async inactivatePartner(@Param('id', ParseIntPipe) id: number) {
  return this.partnersService.inactivatePartner(id);
}

@Patch(':id/activate')
@Permissions({ resource: Resource.PARTNERS, actions: [Action.UPDATE,Action.MANAGE] })
async activatePartner(@Param('id', ParseIntPipe) id: number) {
  return this.partnersService.activatePartner(id);
}
}
