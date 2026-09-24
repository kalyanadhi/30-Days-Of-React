import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TalentMatrixService } from './talent-matrix.service';
import { CreateTalentMatrixEntryDto } from './dto/create-talent-matrix-entry.dto';
import { UpdateTalentMatrixEntryDto } from './dto/update-talent-matrix-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('talent-matrix')
export class TalentMatrixController {
  constructor(private readonly talentMatrixService: TalentMatrixService) {}

  @Get()
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findAll() {
    return this.talentMatrixService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    this.assertCanView(user, employeeId);
    return this.talentMatrixService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findOne(@Param('id') id: string) {
    return this.talentMatrixService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateTalentMatrixEntryDto) {
    return this.talentMatrixService.upsertForEmployee(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateTalentMatrixEntryDto) {
    return this.talentMatrixService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.talentMatrixService.remove(id);
  }

  private assertCanView(user: AuthenticatedUser, employeeId: string): void {
    if (user.role === Role.ENGINEERING_MANAGER || user.role === Role.DIRECTOR) {
      return;
    }

    if (user.role === Role.EMPLOYEE && user.employeeId === employeeId) {
      return;
    }

    throw new ForbiddenException('You do not have access to this talent matrix data');
  }
}
