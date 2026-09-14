import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface ReportDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  supportsQuarter: boolean;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  private readonly http = inject(HttpClient);

  readonly reports: ReportDefinition[] = [
    { key: 'team-performance', label: 'Team Performance', description: 'Overall performance scores and trends for your entire team.', icon: 'bar_chart', supportsQuarter: false },
    { key: 'quarterly-review', label: 'Quarterly Review', description: 'Evaluation results aggregated by quarter and year.', icon: 'calendar_today', supportsQuarter: true },
    { key: 'promotion-candidates', label: 'Promotion Candidates', description: 'Employees who are near-ready or promotion-ready.', icon: 'trending_up', supportsQuarter: false },
    { key: 'talent-matrix', label: 'Talent Matrix', description: '9-box talent grid showing performance vs. potential.', icon: 'grid_view', supportsQuarter: false },
    { key: 'learning-growth', label: 'Learning & Growth', description: 'Training completion rates and certification status.', icon: 'menu_book', supportsQuarter: false },
    { key: 'high-performers', label: 'High Performers', description: 'Top performers sorted by overall evaluation score.', icon: 'star', supportsQuarter: false },
    { key: 'risk-assessment', label: 'Risk Assessment', description: 'Attrition, burnout, and skill gap risk overview.', icon: 'warning', supportsQuarter: false },
  ];

  readonly selectedYear = signal<number>(new Date().getFullYear());
  readonly selectedQuarter = signal<string>('');
  readonly exportingKey = signal<string | null>(null);
  readonly previewingKey = signal<string | null>(null);
  readonly previewData = signal<Record<string, unknown> | null>(null);
  readonly previewLoading = signal(false);

  readonly years = [2023, 2024, 2025];
  readonly quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  preview(report: ReportDefinition): void {
    this.previewingKey.set(report.key);
    this.previewData.set(null);
    this.previewLoading.set(true);

    let params = new HttpParams();
    if (report.supportsQuarter) {
      params = params.set('year', this.selectedYear().toString());
      if (this.selectedQuarter()) params = params.set('quarter', this.selectedQuarter());
    }

    this.http.get<Record<string, unknown>>(`${environment.apiUrl}/reports/${report.key}`, { params }).subscribe({
      next: (data) => {
        this.previewData.set(data);
        this.previewLoading.set(false);
      },
      error: () => this.previewLoading.set(false),
    });
  }

  export(report: ReportDefinition, format: 'csv' | 'excel' | 'pdf'): void {
    this.exportingKey.set(`${report.key}-${format}`);

    let params = new HttpParams().set('format', format);
    if (report.supportsQuarter) {
      params = params.set('year', this.selectedYear().toString());
      if (this.selectedQuarter()) params = params.set('quarter', this.selectedQuarter());
    }

    this.http.get(`${environment.apiUrl}/reports/${report.key}/export`, { params, responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        const blob = response.body!;
        const contentDisposition = response.headers.get('Content-Disposition') ?? '';
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `${report.key}-report.${format}`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.exportingKey.set(null);
      },
      error: () => this.exportingKey.set(null),
    });
  }

  previewRows(data: Record<string, unknown>): unknown[] {
    if (Array.isArray(data)) return (data as unknown[]).slice(0, 5);
    const firstArrayKey = Object.keys(data).find((k) => Array.isArray(data[k]));
    if (firstArrayKey) return (data[firstArrayKey] as unknown[]).slice(0, 5);
    return [];
  }

  previewKeys(rows: unknown[]): string[] {
    if (!rows.length) return [];
    return Object.keys(rows[0] as Record<string, unknown>).slice(0, 6);
  }

  closePreview(): void {
    this.previewingKey.set(null);
    this.previewData.set(null);
  }
}
