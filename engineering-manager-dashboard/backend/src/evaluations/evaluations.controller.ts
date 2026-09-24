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
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  findAll(
    @Query('employeeId') employeeId: string,
    @Query('year') year: string,
    @Query('quarter') quarter: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const targetEmployeeId = this.resolveEmployeeId(user, employeeId);

    return this.evaluationsService.findAll({
      employeeId: targetEmployeeId,
      year: year ? parseInt(year, 10) : undefined,
      quarter,
    });
  }

  @Get('trend/:employeeId')
  getTrend(@Param('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    this.assertCanView(user, employeeId);
    return this.evaluationsService.getTrend(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.evaluationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.evaluationsService.remove(id);
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

    throw new ForbiddenException('You do not have access to these evaluations');
  }
}
