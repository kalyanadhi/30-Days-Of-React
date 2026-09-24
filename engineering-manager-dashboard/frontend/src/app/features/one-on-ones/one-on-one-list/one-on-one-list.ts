import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { OneOnOnesService } from '../../../core/services/one-on-ones.service';
import { OneOnOne } from '../../../core/models/one-on-one.model';
import { OneOnOneFormDialog } from '../one-on-one-form-dialog/one-on-one-form-dialog';

@Component({
  selector: 'app-one-on-one-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  templateUrl: './one-on-one-list.html',
  styleUrl: './one-on-one-list.scss',
})
export class OneOnOneList {
  private readonly oneOnOnesService = inject(OneOnOnesService);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = signal(true);
  readonly items = signal<OneOnOne[]>([]);
  readonly selectedMonthYear = signal('');
  readonly selected = signal<OneOnOne | null>(null);

  readonly displayedColumns = ['employee', 'meetingDate', 'actionItems', 'followUpDate', 'hasNotes', 'actions'];

  readonly sortedItems = computed(() =>
    [...this.items()].sort(
      (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
    ),
  );

  readonly monthYearOptions = computed(() => {
    const seen = new Set<string>();
    return this.sortedItems()
      .map((item) => {
        const d = new Date(item.meetingDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })
      .filter((key) => {
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });

  readonly filteredItems = computed(() => {
    const filter = this.selectedMonthYear();
    if (!filter) return this.sortedItems();
    return this.sortedItems().filter((item) => {
      const d = new Date(item.meetingDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === filter;
    });
  });

  readonly totalThisQuarter = computed(() => {
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return this.items().filter((i) => new Date(i.meetingDate) >= quarterStart).length;
  });

  readonly avgPerEmployee = computed(() => {
    const items = this.items();
    if (items.length === 0) return 0;
    const uniqueEmployees = new Set(items.map((i) => i.employeeId)).size;
    return uniqueEmployees === 0 ? 0 : Math.round((items.length / uniqueEmployees) * 10) / 10;
  });

  readonly employeesWithoutRecentOneOnOne = computed(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEmployeeIds = new Set(
      this.items()
        .filter((i) => new Date(i.meetingDate) >= thirtyDaysAgo)
        .map((i) => i.employeeId),
    );
    const allEmployeeIds = new Set(this.items().map((i) => i.employeeId));
    return allEmployeeIds.size - recentEmployeeIds.size;
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.oneOnOnesService.findAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(OneOnOneFormDialog, {
      data: {},
      width: '560px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  openEditDialog(row: OneOnOne, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(OneOnOneFormDialog, {
      data: { oneOnOne: row },
      width: '560px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  select(row: OneOnOne): void {
    this.selected.set(this.selected()?.id === row.id ? null : row);
  }

  formatMonthYear(key: string): string {
    const [year, month] = key.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }
}
