import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';
import { UserSessionService } from './user-session.service';

@Controller('user-session')
export class UserSessionController {
  constructor(private readonly sessionService: UserSessionService) {}

  @Post('start')
  async startSession(@Body() dto: CreateUserSessionDto) {
    return this.sessionService.createSession(dto);
  }

  @Put('end/:id')
  async endSession(@Param('id') id: number) {
    const result = await this.sessionService.endSession(Number(id));
    return { success: result };
  }

  @Put('update')
  async updateSession(@Body() dto: UpdateUserSessionDto) {
    return this.sessionService.updateSession(dto);
  }

  @Get()
  getAllSessions() {
    return this.sessionService.getAllSessions();
  }

  @Get(':id')
  getSessionById(@Param('id') id: number) {
    return this.sessionService.getSessionById(Number(id));
  }

  @Get(':id/active')
  isSessionActive(@Param('id') id: number) {
    return this.sessionService.isSessionActive(Number(id));
  }

  @Delete(':id')
  deleteSession(@Param('id') id: number) {
    return this.sessionService.deleteSession(Number(id));
  }
}
