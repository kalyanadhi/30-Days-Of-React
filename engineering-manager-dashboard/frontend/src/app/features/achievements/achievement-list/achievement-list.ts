import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AchievementsService } from '../../../core/services/achievements.service';
import { Achievement } from '../../../core/models/achievement.model';
import { AchievementCategory } from '../../../core/models/enums';
import { AchievementFormDialog } from '../achievement-form-dialog/achievement-form-dialog';

@Component({
  selector: 'app-achievement-list',
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
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './achievement-list.html',
  styleUrl: './achievement-list.scss',
})
export class AchievementList {
  private readonly achievementsService = inject(AchievementsService);
  private readonly dialog = inject(MatDialog);

  readonly AchievementCategory = AchievementCategory;
  readonly isLoading = signal(true);
  readonly items = signal<Achievement[]>([]);
  readonly categoryFilter = signal<AchievementCategory | ''>('');

  readonly displayedColumns = ['title', 'employee', 'category', 'date', 'impact'];

  readonly categoryOptions: AchievementCategory[] = [
    AchievementCategory.DELIVERY,
    AchievementCategory.TECHNICAL,
    AchievementCategory.LEADERSHIP,
    AchievementCategory.CUSTOMER_APPRECIATION,
    AchievementCategory.INNOVATION,
    AchievementCategory.PROCESS_IMPROVEMENT,
  ];

  readonly filteredItems = computed(() => {
    const filter = this.categoryFilter();
    if (!filter) return this.items();
    return this.items().filter((i) => i.category === filter);
  });

  readonly categoryBreakdown = computed(() => {
    const counts: Partial<Record<AchievementCategory, number>> = {};
    for (const item of this.items()) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.achievementsService.findAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AchievementFormDialog, { width: '480px' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  categoryIcon(c: AchievementCategory): string {
    switch (c) {
      case AchievementCategory.DELIVERY:
        return 'local_shipping';
      case AchievementCategory.TECHNICAL:
        return 'code';
      case AchievementCategory.LEADERSHIP:
        return 'supervisor_account';
      case AchievementCategory.CUSTOMER_APPRECIATION:
        return 'star';
      case AchievementCategory.INNOVATION:
        return 'lightbulb';
      case AchievementCategory.PROCESS_IMPROVEMENT:
        return 'build';
    }
  }

  categoryColor(c: AchievementCategory): string {
    switch (c) {
      case AchievementCategory.DELIVERY:
        return 'text-blue-600';
      case AchievementCategory.TECHNICAL:
        return 'text-purple-600';
      case AchievementCategory.LEADERSHIP:
        return 'text-green-600';
      case AchievementCategory.CUSTOMER_APPRECIATION:
        return 'text-amber-500';
      case AchievementCategory.INNOVATION:
        return 'text-cyan-600';
      case AchievementCategory.PROCESS_IMPROVEMENT:
        return 'text-orange-500';
    }
  }

  categoryLabel(c: AchievementCategory): string {
    switch (c) {
      case AchievementCategory.DELIVERY:
        return 'Delivery';
      case AchievementCategory.TECHNICAL:
        return 'Technical';
      case AchievementCategory.LEADERSHIP:
        return 'Leadership';
      case AchievementCategory.CUSTOMER_APPRECIATION:
        return 'Customer';
      case AchievementCategory.INNOVATION:
        return 'Innovation';
      case AchievementCategory.PROCESS_IMPROVEMENT:
        return 'Process';
    }
  }
}
