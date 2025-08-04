// workflow-discussion.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { TransitionPhaseDto } from './dto/transition-phase.dto';
import { WorkflowDiscussionService } from './workflow-discussion.service';

@Controller('workflow-discussions')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class WorkflowDiscussionController {
  constructor(private readonly service: WorkflowDiscussionService) {}

  @Get(':id')
  async getDiscussion(@Param('id') id: number) {
    return this.service.getFullDiscussion(id);
  }


@Post(':id/messages')
@UsePipes(new ValidationPipe({ transform: true }))
async addMessage(
  @Param('id') id: number,
  @Body() body: any, // Receive raw body
  @CurrentUser() user: User,
) {
  const dto = plainToInstance(CreateMessageDto, body);
  console.log('Received dto:', dto);
  return this.service.addMessage(id, dto, user);
}

  @Post(':id/transition')
  async transitionPhase(
    @Param('id') id: number,
    @Body() dto: TransitionPhaseDto,
  ) {
    return this.service.transitionPhase(id, dto);
  }
}