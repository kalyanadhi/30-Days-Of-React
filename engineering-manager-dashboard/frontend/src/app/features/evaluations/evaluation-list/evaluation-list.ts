import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { PerformanceEvaluation } from '../../../core/models/evaluation.model';
import { Employee } from '../../../core/models/employee.model';
import { Quarter, RatingBand } from '../../../core/models/enums';
import { EvaluationFormDialog } from '../evaluation-form-dialog/evaluation-form-dialog';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    EvaluationFormDialog,
  ],
  templateUrl: './evaluation-list.html',
  styleUrl: './evaluation-list.scss',
})
export class EvaluationList {
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly employeesService = inject(EmployeesService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['employee', 'quarter', 'year', 'overallScore', 'ratingBand', 'status', 'actions'];
  readonly quarters = Object.values(Quarter);
  readonly availableYears = [2023, 2024, 2025];

  readonly isLoading = signal(true);
  readonly evaluations = signal<PerformanceEvaluation[]>([]);
  readonly employeeMap = signal<Map<string, Employee>>(new Map());

  readonly selectedQuarter = signal<Quarter | ''>('');
  readonly selectedYear = signal<number | ''>('');

  readonly filteredEvaluations = computed(() => {
    const quarter = this.selectedQuarter();
    const year = this.selectedYear();
    return this.evaluations().filter((ev) => {
      const matchesQuarter = !quarter || ev.quarter === quarter;
      const matchesYear = !year || ev.year === year;
      return matchesQuarter && matchesYear;
    });
  });

  constructor() {
    this.loadData();

    this.employeesService.findAll().subscribe({
      next: (employees) => {
        const map = new Map<string, Employee>();
        for (const emp of employees) {
          map.set(emp.id, emp);
        }
        this.employeeMap.set(map);
      },
      error: () => {},
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.evaluationsService.findAll().subscribe({
      next: (data) => {
        this.evaluations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openForm(evaluation?: PerformanceEvaluation): void {
    this.dialog
      .open(EvaluationFormDialog, {
        width: '640px',
        data: { evaluation },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadData();
      });
  }

  getEmployeeName(employeeId: string): string {
    const emp = this.employeeMap().get(employeeId);
    return emp ? emp.fullName : employeeId;
  }

  ratingColor(band: RatingBand): string {
    switch (band) {
      case RatingBand.OUTSTANDING:
        return 'text-green-600';
      case RatingBand.EXCEEDS_EXPECTATIONS:
        return 'text-blue-600';
      case RatingBand.MEETS_EXPECTATIONS:
        return 'text-on-surface';
      case RatingBand.NEEDS_IMPROVEMENT:
        return 'text-warning!';
      case RatingBand.UNSATISFACTORY:
        return 'text-error!';
      default:
        return 'text-on-surface';
    }
  }

  clearFilters(): void {
    this.selectedQuarter.set('');
    this.selectedYear.set('');
  }
}
