import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RiskService } from './risk.service';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from './dto/update-risk-assessment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get()
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findAll(@Query('employeeId') employeeId: string) {
    return this.riskService.findAll({ employeeId });
  }

  @Get('heatmap')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  getHeatmap() {
    return this.riskService.getHeatmap();
  }

  @Get('latest/:employeeId')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  getLatest(@Param('employeeId') employeeId: string) {
    return this.riskService.findLatestForEmployee(employeeId);
  }

  @Get(':id')
  @Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
  findOne(@Param('id') id: string) {
    return this.riskService.findOne(id);
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateRiskAssessmentDto) {
    return this.riskService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateRiskAssessmentDto) {
    return this.riskService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.riskService.remove(id);
  }
}
