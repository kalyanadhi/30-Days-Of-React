import { BadRequestException, Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { buildCsv, buildExcel, buildPdf } from './report-export.util';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ExportFormat, ReportType, Role } from '../common/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('team-performance')
  getTeamPerformance() {
    return this.reportsService.getReportData(ReportType.TEAM_PERFORMANCE);
  }

  @Get('quarterly-review')
  getQuarterlyReview(@Query('year') year?: string, @Query('quarter') quarter?: string) {
    return this.reportsService.getReportData(ReportType.QUARTERLY_REVIEW, {
      year: year ? parseInt(year, 10) : undefined,
      quarter,
    });
  }

  @Get('promotion-candidates')
  getPromotionCandidates() {
    return this.reportsService.getReportData(ReportType.PROMOTION_CANDIDATES);
  }

  @Get('talent-matrix')
  getTalentMatrix() {
    return this.reportsService.getReportData(ReportType.TALENT_MATRIX);
  }

  @Get('learning-growth')
  getLearningGrowth() {
    return this.reportsService.getReportData(ReportType.LEARNING_GROWTH);
  }

  @Get('high-performers')
  getHighPerformers() {
    return this.reportsService.getReportData(ReportType.HIGH_PERFORMERS);
  }

  @Get('risk-assessment')
  getRiskAssessment() {
    return this.reportsService.getReportData(ReportType.RISK_ASSESSMENT);
  }

  @Get(':type/export')
  async export(
    @Param('type') type: string,
    @Query('format') format: string,
    @Query('year') year: string | undefined,
    @Query('quarter') quarter: string | undefined,
    @Res() res: Response,
  ) {
    if (!Object.values(ReportType).includes(type as ReportType)) {
      throw new BadRequestException(`Unknown report type: ${type}`);
    }

    if (!Object.values(ExportFormat).includes(format as ExportFormat)) {
      throw new BadRequestException(`Unknown export format: ${format}`);
    }

    const report = await this.reportsService.getReportData(type as ReportType, {
      year: year ? parseInt(year, 10) : undefined,
      quarter,
    });

    const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

    switch (format as ExportFormat) {
      case ExportFormat.CSV: {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(buildCsv(report));
        return;
      }
      case ExportFormat.EXCEL: {
        const buffer = await buildExcel(report);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        res.send(buffer);
        return;
      }
      case ExportFormat.PDF: {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        const doc = buildPdf(report);
        doc.pipe(res);
        return;
      }
    }
  }
}
