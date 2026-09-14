import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RiskService } from '../../../core/services/risk.service';
import { RiskHeatmap } from '../../../core/models/risk.model';
import { RiskLevel } from '../../../core/models/enums';

@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './risk-dashboard.html',
  styleUrl: './risk-dashboard.scss',
})
export class RiskDashboard {
  private readonly riskService = inject(RiskService);

  readonly RiskLevel = RiskLevel;
  readonly isLoading = signal(true);
  readonly heatmap = signal<RiskHeatmap | null>(null);
  readonly showOnlyHighRisk = signal(false);

  readonly displayedColumns = ['employee', 'attrition', 'burnout', 'skillGap', 'performance'];

  readonly filteredItems = computed(() => {
    const items = this.heatmap()?.items ?? [];
    if (!this.showOnlyHighRisk()) return items;
    return items.filter(
      (item) =>
        item.assessment.attritionRisk === RiskLevel.HIGH ||
        item.assessment.burnoutRisk === RiskLevel.HIGH ||
        item.assessment.skillGapRisk === RiskLevel.HIGH ||
        item.assessment.performanceRisk === RiskLevel.HIGH
    );
  });

  constructor() {
    this.riskService.getHeatmap().subscribe({
      next: (data) => {
        this.heatmap.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  riskColor(level: RiskLevel): string {
    switch (level) {
      case RiskLevel.LOW:
        return 'text-green-600';
      case RiskLevel.MEDIUM:
        return 'text-warning!';
      case RiskLevel.HIGH:
        return 'text-error!';
      default:
        return 'text-on-surface-variant';
    }
  }

  riskBadgeClass(level: RiskLevel): string {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM:
        return 'bg-amber-100 text-amber-800';
      case RiskLevel.HIGH:
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  }

  hasHighRisk(item: RiskHeatmap['items'][0]): boolean {
    return (
      item.assessment.attritionRisk === RiskLevel.HIGH ||
      item.assessment.burnoutRisk === RiskLevel.HIGH ||
      item.assessment.skillGapRisk === RiskLevel.HIGH ||
      item.assessment.performanceRisk === RiskLevel.HIGH
    );
  }
}
