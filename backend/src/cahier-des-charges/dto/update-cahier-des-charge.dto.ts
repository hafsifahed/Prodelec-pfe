import { PartialType } from '@nestjs/swagger';
import { CreateCahierDesChargesDto } from './create-cahier-des-charge.dto';

export class UpdateCahierDesChargeDto extends PartialType(CreateCahierDesChargesDto) {}
