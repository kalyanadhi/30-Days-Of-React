import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DevelopmentPlansService } from '../../../core/services/development-plans.service';
import { DevelopmentPlan } from '../../../core/models/development-plan.model';
import { GoalStatus } from '../../../core/models/enums';
import { DevelopmentPlanFormDialog } from '../development-plan-form-dialog/development-plan-form-dialog';

@Component({
  selector: 'app-development-plan-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './development-plan-list.html',
  styleUrl: './development-plan-list.scss',
})
export class DevelopmentPlanList {
  private readonly developmentPlansService = inject(DevelopmentPlansService);
  private readonly dialog = inject(MatDialog);

  readonly GoalStatus = GoalStatus;
  readonly isLoading = signal(true);
  readonly items = signal<DevelopmentPlan[]>([]);
  readonly statusFilter = signal<GoalStatus | ''>('');

  readonly displayedColumns = ['title', 'employee', 'targetSkills', 'startDate', 'targetDate', 'status', 'actions'];

  readonly statusOptions: GoalStatus[] = [
    GoalStatus.NOT_STARTED,
    GoalStatus.IN_PROGRESS,
    GoalStatus.AT_RISK,
    GoalStatus.COMPLETED,
  ];

  readonly filteredItems = computed(() => {
    const filter = this.statusFilter();
    if (!filter) return this.items();
    return this.items().filter((i) => i.status === filter);
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.developmentPlansService.findAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(DevelopmentPlanFormDialog, {
      data: {},
      width: '600px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  openEditDialog(plan: DevelopmentPlan, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(DevelopmentPlanFormDialog, {
      data: { plan },
      width: '600px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  statusColor(s: GoalStatus): string {
    switch (s) {
      case GoalStatus.COMPLETED:
        return 'text-green-600';
      case GoalStatus.IN_PROGRESS:
        return 'text-blue-600';
      case GoalStatus.AT_RISK:
        return 'text-error';
      case GoalStatus.NOT_STARTED:
      default:
        return 'text-on-surface-variant';
    }
  }

  statusLabel(s: GoalStatus): string {
    switch (s) {
      case GoalStatus.NOT_STARTED:
        return 'Not Started';
      case GoalStatus.IN_PROGRESS:
        return 'In Progress';
      case GoalStatus.AT_RISK:
        return 'At Risk';
      case GoalStatus.COMPLETED:
        return 'Completed';
    }
  }

  isOverdue(plan: DevelopmentPlan): boolean {
    return plan.status !== GoalStatus.COMPLETED && new Date(plan.targetDate) < new Date();
  }
}
