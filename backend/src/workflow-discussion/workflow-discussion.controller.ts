import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/users.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { TransitionPhaseDto } from './dto/transition-phase.dto';
import { WorkflowDiscussion } from './entities/workflow-discussion.entity';
import { WorkflowDiscussionService } from './workflow-discussion.service';

@Controller('workflow-discussions')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class WorkflowDiscussionController {
  constructor(private readonly service: WorkflowDiscussionService) {}

  @Get()
  async getAllDiscussions(
        @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('search') search?: string,
  ) {
    return this.service.getAllDiscussions(page, limit, user.id, search);
  }

  @Get('my-discussions')
  async getDiscussionsByUser(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('search') search?: string
  ) {
    if (user.role?.name?.toUpperCase().includes('CLIENT')) {
      return this.service.getDiscussionsByUser(user.id, page, limit, search);
    } else {
      return this.service.getAllDiscussions(page, limit, user.id, search);
    }
  }

  @Get(':id/full')
  async getFullDiscussion(@Param('id') id: number): Promise<WorkflowDiscussion> {
    return this.service.getFullDiscussion(id);
  }

  @Get(':id')
  async getDiscussion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ): Promise<WorkflowDiscussion> {
    return this.service.getDiscussion(id, user.id);
  }

  @Post(':id/mark-as-read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    await this.service.markMessagesAsRead(id, user.id);
    return { success: true };
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.service.addMessage(id, body, user);
  }

  @Post(':id/transition')
  async transitionPhase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransitionPhaseDto,
  ) {
    return this.service.transitionPhase(id, dto);
  }
}