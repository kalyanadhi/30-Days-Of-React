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
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId =
      user.role === Role.EMPLOYEE ? user.employeeId ?? undefined : employeeId;

    return this.achievementsService.findAll({ employeeId: targetEmployeeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAchievementDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === Role.EMPLOYEE) {
      dto.employeeId = user.employeeId as string;
    }

    return this.achievementsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.achievementsService.findOne(id);

    if (user.role !== Role.ENGINEERING_MANAGER) {
      if (user.role !== Role.EMPLOYEE || existing.employeeId !== user.employeeId) {
        throw new ForbiddenException('You do not have access to update this achievement');
      }
    }

    return this.achievementsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const existing = await this.achievementsService.findOne(id);

    if (user.role !== Role.ENGINEERING_MANAGER) {
      if (user.role !== Role.EMPLOYEE || existing.employeeId !== user.employeeId) {
        throw new ForbiddenException('You do not have access to delete this achievement');
      }
    }

    return this.achievementsService.remove(id);
  }
}
