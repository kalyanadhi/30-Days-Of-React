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
import { PromotionReadinessService } from './promotion-readiness.service';
import { CreatePromotionReadinessDto } from './dto/create-promotion-readiness.dto';
import { UpdatePromotionReadinessDto } from './dto/update-promotion-readiness.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promotion-readiness')
export class PromotionReadinessController {
  constructor(private readonly promotionReadinessService: PromotionReadinessService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId = this.resolveEmployeeId(user, employeeId);
    return this.promotionReadinessService.findAll({ employeeId: targetEmployeeId });
  }

  @Get('dashboard')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  getDashboard() {
    return this.promotionReadinessService.getDashboard();
  }

  @Get('latest/:employeeId')
  getLatest(@Param('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    this.assertCanView(user, employeeId);
    return this.promotionReadinessService.findLatestForEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionReadinessService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreatePromotionReadinessDto) {
    return this.promotionReadinessService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdatePromotionReadinessDto) {
    return this.promotionReadinessService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.promotionReadinessService.remove(id);
  }

  private resolveEmployeeId(user: AuthenticatedUser, requestedEmployeeId?: string): string | undefined {
    if (user.role === Role.EMPLOYEE) {
      return user.employeeId ?? undefined;
    }

    return requestedEmployeeId;
  }

  private assertCanView(user: AuthenticatedUser, employeeId: string): void {
    if (user.role === Role.ENGINEERING_MANAGER || user.role === Role.DIRECTOR) {
      return;
    }

    if (user.role === Role.EMPLOYEE && user.employeeId === employeeId) {
      return;
    }

    throw new ForbiddenException('You do not have access to this promotion readiness data');
  }
}
