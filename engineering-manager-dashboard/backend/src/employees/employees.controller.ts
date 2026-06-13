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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get('departments')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  getDepartments() {
    return this.employeesService.getDistinctDepartments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    this.assertCanView(user, id);
    return this.employeesService.findOne(id);
  }

  @Get(':id/team')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findTeam(@Param('id') id: string) {
    return this.employeesService.findTeam(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  private assertCanView(user: AuthenticatedUser, employeeId: string): void {
    if (user.role === Role.ENGINEERING_MANAGER || user.role === Role.DIRECTOR) {
      return;
    }

    if (user.role === Role.EMPLOYEE && user.employeeId === employeeId) {
      return;
    }

    throw new ForbiddenException('You do not have access to this employee profile');
  }
}
