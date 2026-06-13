import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateLearningActivityDto } from './dto/create-learning-activity.dto';
import { UpdateLearningActivityDto } from './dto/update-learning-activity.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId = this.resolveEmployeeId(user, employeeId);
    return this.learningService.findAll({ employeeId: targetEmployeeId });
  }

  @Get('summary')
  async getSummary(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId = this.resolveEmployeeId(user, employeeId);

    if (!targetEmployeeId) {
      return { totalLearningHours: 0, certificationsEarned: 0, skillsAcquired: [] };
    }

    return this.learningService.getSummary(targetEmployeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateLearningActivityDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === Role.EMPLOYEE) {
      dto.employeeId = user.employeeId ?? dto.employeeId;
    }

    return this.learningService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLearningActivityDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.assertCanModify(id, user);
    return this.learningService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.assertCanModify(id, user);
    return this.learningService.remove(id);
  }

  private resolveEmployeeId(user: AuthenticatedUser, requestedEmployeeId?: string): string | undefined {
    if (user.role === Role.EMPLOYEE) {
      return user.employeeId ?? undefined;
    }

    return requestedEmployeeId;
  }

  private async assertCanModify(id: string, user: AuthenticatedUser): Promise<void> {
    if (user.role === Role.ENGINEERING_MANAGER) {
      return;
    }

    if (user.role === Role.EMPLOYEE) {
      const existing = await this.learningService.findOne(id);
      if (existing.employeeId === user.employeeId) {
        return;
      }
    }

    throw new ForbiddenException('You do not have access to modify this learning activity');
  }
}
