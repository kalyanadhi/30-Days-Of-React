import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TalentMatrixService } from '../../../core/services/talent-matrix.service';
import { TalentMatrixEntry } from '../../../core/models/talent-matrix.model';
import { TalentCategory } from '../../../core/models/enums';

interface GridCell {
  label: string;
  perfLevel: number;
  potentialLevel: number;
  bgClass: string;
  employees: TalentMatrixEntry[];
}

@Component({
  selector: 'app-talent-matrix-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './talent-matrix-page.html',
  styleUrl: './talent-matrix-page.scss',
})
export class TalentMatrixPage {
  private readonly talentMatrixService = inject(TalentMatrixService);

  readonly TalentCategory = TalentCategory;
  readonly isLoading = signal(true);
  readonly entries = signal<TalentMatrixEntry[]>([]);

  private toLevel(score: number): number {
    if (score <= 3) return 1;
    if (score <= 6) return 2;
    return 3;
  }

  readonly gridCells = computed<GridCell[]>(() => {
    const allEntries = this.entries();

    const cellDefs: Array<{ perf: number; pot: number; label: string; bgClass: string }> = [
      { perf: 1, pot: 3, label: 'Enigmas', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
      { perf: 2, pot: 3, label: 'High Potentials', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
      { perf: 3, pot: 3, label: 'Future Leaders', bgClass: 'bg-green-100 dark:bg-green-900/30' },
      { perf: 1, pot: 2, label: 'Lower Performers', bgClass: 'bg-surface-container' },
      { perf: 2, pot: 2, label: 'Core Contributors', bgClass: 'bg-surface-container' },
      { perf: 3, pot: 2, label: 'Core Contributors+', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
      { perf: 1, pot: 1, label: 'Under Performers', bgClass: 'bg-red-100 dark:bg-red-900/30' },
      { perf: 2, pot: 1, label: 'Solid Performers', bgClass: 'bg-surface-container' },
      { perf: 3, pot: 1, label: 'High Performers', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    return cellDefs.map((def) => ({
      label: def.label,
      perfLevel: def.perf,
      potentialLevel: def.pot,
      bgClass: def.bgClass,
      employees: allEntries.filter(
        (e) =>
          this.toLevel(e.performanceScore) === def.perf &&
          this.toLevel(e.potentialScore) === def.pot
      ),
    }));
  });

  readonly categoryCounts = computed(() => {
    const entries = this.entries();
    const counts: Record<TalentCategory, number> = {
      [TalentCategory.FUTURE_LEADER]: 0,
      [TalentCategory.HIGH_PERFORMER]: 0,
      [TalentCategory.CORE_CONTRIBUTOR]: 0,
      [TalentCategory.EMERGING_TALENT]: 0,
      [TalentCategory.UNDERPERFORMER]: 0,
    };
    for (const e of entries) {
      if (e.category in counts) {
        counts[e.category]++;
      }
    }
    return counts;
  });

  constructor() {
    this.talentMatrixService.findAll().subscribe({
      next: (data) => {
        this.entries.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
