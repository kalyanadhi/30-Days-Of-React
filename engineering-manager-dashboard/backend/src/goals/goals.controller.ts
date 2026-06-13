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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId =
      user.role === Role.EMPLOYEE ? user.employeeId ?? undefined : employeeId;

    return this.goalsService.findAll({ employeeId: targetEmployeeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalsService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateGoalDto) {
    return this.goalsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.goalsService.findOne(id);

    if (user.role !== Role.ENGINEERING_MANAGER) {
      if (user.role !== Role.EMPLOYEE || existing.employeeId !== user.employeeId) {
        throw new ForbiddenException('You do not have access to update this goal');
      }
    }

    return this.goalsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.goalsService.remove(id);
  }
}
