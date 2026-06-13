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
import { OneOnOnesService } from './one-on-ones.service';
import { CreateOneOnOneDto } from './dto/create-one-on-one.dto';
import { UpdateOneOnOneDto } from './dto/update-one-on-one.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('one-on-ones')
export class OneOnOnesController {
  constructor(private readonly oneOnOnesService: OneOnOnesService) {}

  @Get()
  findAll(@Query('employeeId') employeeId: string, @CurrentUser() user: AuthenticatedUser) {
    const targetEmployeeId =
      user.role === Role.EMPLOYEE ? user.employeeId ?? undefined : employeeId;

    return this.oneOnOnesService.findAll({ employeeId: targetEmployeeId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const oneOnOne = await this.oneOnOnesService.findOne(id);

    if (user.role === Role.EMPLOYEE && oneOnOne.employeeId !== user.employeeId) {
      throw new ForbiddenException('You do not have access to this one-on-one');
    }

    return oneOnOne;
  }

  @Post()
  @Roles(Role.ENGINEERING_MANAGER)
  create(@Body() dto: CreateOneOnOneDto) {
    return this.oneOnOnesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateOneOnOneDto) {
    return this.oneOnOnesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ENGINEERING_MANAGER)
  remove(@Param('id') id: string) {
    return this.oneOnOnesService.remove(id);
  }
}
