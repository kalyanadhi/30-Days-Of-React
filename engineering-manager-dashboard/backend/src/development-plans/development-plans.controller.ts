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
import { DevelopmentPlansService } from './development-plans.service';
import { CreateDevelopmentPlanDto } from './dto/create-development-plan.dto';
import { UpdateDevelopmentPlanDto } from './dto/update-development-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('development-plans')
export class DevelopmentPlansController {
  constructor(private readonly developmentPlansService: DevelopmentPlansService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId =
      user.role === Role.EMPLOYEE ? user.employeeId ?? undefined : employeeId;

    return this.developmentPlansService.findAll({ employeeId: targetEmployeeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.developmentPlansService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateDevelopmentPlanDto) {
    return this.developmentPlansService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDevelopmentPlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.developmentPlansService.findOne(id);

    if (user.role !== Role.ENGINEERING_MANAGER) {
      if (user.role !== Role.EMPLOYEE || existing.employeeId !== user.employeeId) {
        throw new ForbiddenException('You do not have access to update this development plan');
      }

      const { status, notes } = dto;
      dto = {};
      if (status !== undefined) {
        dto.status = status;
      }
      if (notes !== undefined) {
        dto.notes = notes;
      }
    }

    return this.developmentPlansService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.developmentPlansService.remove(id);
  }
}
