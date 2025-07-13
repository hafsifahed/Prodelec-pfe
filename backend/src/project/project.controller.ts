import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Action } from '../roles/enums/action.enum';
import { Resource } from '../roles/enums/resource.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@UseGuards(JwtAuthGuard,PermissionsGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projSrv: ProjectService) {}

  /* ------------------- CRUD de base ------------------- */
@Post()
@Permissions({ resource: Resource.PROJECT, actions: [Action.CREATE,Action.MANAGE] })
create(
  @Body() dto: CreateProjectDto,
  @Query('idOrder') idOrder: number,
  @Query('conceptionResponsible') cr?: string,
  @Query('methodeResponsible') mr?: string,
  @Query('productionResponsible') pr?: string,
  @Query('finalControlResponsible') fcr?: string,
  @Query('deliveryResponsible') dr?: string,
) {
  // Nettoyage des paramètres : passer undefined si vide ou espaces
  const conceptionResponsible = cr?.trim() || undefined;
  const methodeResponsible = mr?.trim() || undefined;
  const productionResponsible = pr?.trim() || undefined;
  const finalControlResponsible = fcr?.trim() || undefined;
  const deliveryResponsible = dr?.trim() || undefined;

  return this.projSrv.addProject(
    dto,
    +idOrder,
    conceptionResponsible,
    methodeResponsible,
    productionResponsible,
    finalControlResponsible,
    deliveryResponsible,
  );
}

@Put(':id')
@Permissions({ resource: Resource.PROJECT, actions: [Action.UPDATE,Action.MANAGE] })
update(
  @Param('id') id: number,
  @Body() body: Partial<Project>,
  @Query('conceptionResponsible') cr?: string,
  @Query('methodeResponsible') mr?: string,
  @Query('productionResponsible') pr?: string,
  @Query('finalControlResponsible') fcr?: string,
  @Query('deliveryResponsible') dr?: string,
) {
  // Même nettoyage côté update
  const conceptionResponsible = cr?.trim() || undefined;
  const methodeResponsible = mr?.trim() || undefined;
  const productionResponsible = pr?.trim() || undefined;
  const finalControlResponsible = fcr?.trim() || undefined;
  const deliveryResponsible = dr?.trim() || undefined;

  return this.projSrv.updateProject(
    +id,
    body,
    conceptionResponsible,
    methodeResponsible,
    productionResponsible,
    finalControlResponsible,
    deliveryResponsible,
  );
}


  @Get()        findAll()        { return this.projSrv.findAll(); }
  @Get(':id')   findOne(@Param('id') id: number) { return this.projSrv.findOne(+id); }
  @Delete(':id')remove(@Param('id') id: number) { return this.projSrv.remove(+id); }
  @Get('partner/:partnerId') getByPartner(@Param('partnerId') partnerId: number) {
  return this.projSrv.getByPartner(Number(partnerId));
}

  /* -------- par utilisateur -------- */
  @Get('user/:uid')
  byUser(@Param('uid') uid: number) { return this.projSrv.getByUser(+uid); }

  /* ------------------- Statuts ON/OFF ------------------- */
  @Put('statusc/:id')  setCOn (@Param('id') id: number) { return this.projSrv.changeStatusConception (+id, true ); }
  @Put('statusc1/:id') setCOff(@Param('id') id: number) { return this.projSrv.changeStatusConception (+id, false); }

  @Put('statusm/:id')  setMOn (@Param('id') id: number) { return this.projSrv.changeStatusMethode    (+id, true ); }
  @Put('statusm1/:id') setMOff(@Param('id') id: number) { return this.projSrv.changeStatusMethode    (+id, false); }

  @Put('statusp/:id')  setPOn (@Param('id') id: number) { return this.projSrv.changeStatusProduction (+id, true ); }
  @Put('statusp1/:id') setPOff(@Param('id') id: number) { return this.projSrv.changeStatusProduction (+id, false); }

  @Put('statusfc/:id')  setFCOn (@Param('id') id: number) { return this.projSrv.changeStatusFC       (+id, true ); }
  @Put('statusfc1/:id') setFCOff(@Param('id') id: number) { return this.projSrv.changeStatusFC       (+id, false); }

  @Put('statusd/:id')  setDOn (@Param('id') id: number) { return this.projSrv.changeStatusDelivery   (+id, true ); }
  @Put('statusd1/:id') setDOff(@Param('id') id: number) { return this.projSrv.changeStatusDelivery   (+id, false); }

  /* ------------------- Progress ------------------------- */
  @Put('progressc/:id/:p')  setProgC (@Param('id') id: number,@Param('p') p: number) { return this.projSrv.setConceptionProgress(+id, +p); }
  @Put('progressm/:id/:p')  setProgM (@Param('id') id: number,@Param('p') p: number) { return this.projSrv.setMethodeProgress   (+id, +p); }
  @Put('progressp/:id/:p')  setProgP (@Param('id') id: number,@Param('p') p: number) { return this.projSrv.setProductionProgress(+id, +p); }
  @Put('progressfc/:id/:p') setProgFC(@Param('id') id: number,@Param('p') p: number) { return this.projSrv.setFcProgress        (+id, +p); }
  @Put('progressd/:id/:p')  setProgD (@Param('id') id: number,@Param('p') p: number) { return this.projSrv.setDeliveryProgress  (+id, +p); }

  @Put('progress/:id')
  compute(@Param('id') id: number) { return this.projSrv.computeGlobalProgress(+id); }

  /* ------------------- Archivage ------------------------ */
  @Put('archivera/:id') toggleA(@Param('id') id: number) { return this.projSrv.toggleArchive(+id, 'archivera'); }
  @Put('archiverc/:id') toggleC(@Param('id') id: number) { return this.projSrv.toggleArchive(+id, 'archiverc'); }

  /* ------------------- Dates réelles -------------------- */
  @Put('realc/:id')  realC (@Param('id') id: number) { return this.projSrv.setProgress(+id, 'realendConception',  new Date() as any); }
  @Put('realm/:id')  realM (@Param('id') id: number) { return this.projSrv.setProgress(+id, 'realendMethode',     new Date() as any); }
  @Put('realp/:id')  realP (@Param('id') id: number) { return this.projSrv.setProgress(+id, 'realendProduction',  new Date() as any); }
  @Put('realfc/:id') realFC(@Param('id') id: number) { return this.projSrv.setProgress(+id, 'realendFc',          new Date() as any); }
  @Put('reall/:id')  realL (@Param('id') id: number) { return this.projSrv.setProgress(+id, 'realendDelivery',    new Date() as any); }
}
