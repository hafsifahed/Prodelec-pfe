import { PartialType } from '@nestjs/swagger';
import { CreateCahierDesChargeDto } from './create-cahier-des-charge.dto';

export class UpdateCahierDesChargeDto extends PartialType(CreateCahierDesChargeDto) {}
