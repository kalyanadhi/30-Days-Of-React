import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromotionReadinessService } from '../../../core/services/promotion-readiness.service';
import { PromotionReadinessDashboard } from '../../../core/models/promotion-readiness.model';
import { PromotionReadinessBand } from '../../../core/models/enums';

@Component({
  selector: 'app-promotion-readiness-page',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './promotion-readiness-page.html',
  styleUrl: './promotion-readiness-page.scss',
})
export class PromotionReadinessPage {
  private readonly promotionReadinessService = inject(PromotionReadinessService);

  readonly PromotionReadinessBand = PromotionReadinessBand;
  readonly isLoading = signal(true);
  readonly dashboard = signal<PromotionReadinessDashboard | null>(null);

  readonly displayedColumns = [
    'employee',
    'designation',
    'department',
    'readinessBand',
    'readinessPercentage',
    'assessmentDate',
  ];

  constructor() {
    this.promotionReadinessService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  bandColor(band: PromotionReadinessBand): string {
    switch (band) {
      case PromotionReadinessBand.NOT_READY:
        return 'text-error!';
      case PromotionReadinessBand.DEVELOPING:
        return 'text-warning!';
      case PromotionReadinessBand.NEAR_READY:
        return 'text-blue-600';
      case PromotionReadinessBand.PROMOTION_READY:
        return 'text-green-600';
      default:
        return 'text-on-surface-variant';
    }
  }

  bandBg(band: PromotionReadinessBand): string {
    switch (band) {
      case PromotionReadinessBand.NOT_READY:
        return 'bg-red-50 dark:bg-red-900/10';
      case PromotionReadinessBand.DEVELOPING:
        return 'bg-amber-50 dark:bg-amber-900/10';
      case PromotionReadinessBand.NEAR_READY:
        return 'bg-blue-50 dark:bg-blue-900/10';
      case PromotionReadinessBand.PROMOTION_READY:
        return 'bg-green-50 dark:bg-green-900/10';
      default:
        return '';
    }
  }
}
