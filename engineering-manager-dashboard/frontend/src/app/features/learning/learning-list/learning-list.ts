import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LearningService } from '../../../core/services/learning.service';
import { LearningActivity } from '../../../core/models/learning.model';
import { LearningCompletionStatus } from '../../../core/models/enums';
import { LearningFormDialog } from '../learning-form-dialog/learning-form-dialog';

@Component({
  selector: 'app-learning-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './learning-list.html',
  styleUrl: './learning-list.scss',
})
export class LearningList {
  private readonly learningService = inject(LearningService);
  private readonly dialog = inject(MatDialog);

  readonly LearningCompletionStatus = LearningCompletionStatus;
  readonly isLoading = signal(true);
  readonly activities = signal<LearningActivity[]>([]);
  readonly filterStatus = signal<LearningCompletionStatus | ''>('');
  readonly filterExpiringSoon = signal(false);

  readonly displayedColumns = ['trainingName', 'skillArea', 'learningHours', 'completionStatus', 'completionDate', 'expiryDate', 'actions'];

  readonly filtered = computed(() => {
    let items = this.activities();
    if (this.filterStatus()) items = items.filter((a) => a.completionStatus === this.filterStatus());
    if (this.filterExpiringSoon()) items = items.filter((a) => this.isExpiringSoon(a.expiryDate));
    return items;
  });

  readonly totalHours = computed(() => this.activities().reduce((sum, a) => sum + a.learningHours, 0));
  readonly completedCount = computed(() => this.activities().filter((a) => a.completionStatus === LearningCompletionStatus.COMPLETED).length);
  readonly inProgressCount = computed(() => this.activities().filter((a) => a.completionStatus === LearningCompletionStatus.IN_PROGRESS).length);
  readonly expiringSoonCount = computed(() => this.activities().filter((a) => this.isExpiringSoon(a.expiryDate)).length);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.learningService.findAll().subscribe({
      next: (items) => {
        this.activities.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(LearningFormDialog, { width: '520px' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditDialog(activity: LearningActivity): void {
    const ref = this.dialog.open(LearningFormDialog, {
      width: '520px',
      data: { activity },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  statusColor(status: LearningCompletionStatus): string {
    switch (status) {
      case LearningCompletionStatus.COMPLETED:
        return 'text-green-600';
      case LearningCompletionStatus.IN_PROGRESS:
        return 'text-blue-600';
      default:
        return 'text-on-surface-variant';
    }
  }

  isExpiringSoon(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    const diff = new Date(expiryDate).getTime() - Date.now();
    return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  }

  isExpired(expiryDate: string | null): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < Date.now();
  }
}
