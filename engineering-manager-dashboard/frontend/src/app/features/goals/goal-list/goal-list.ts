import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoalsService } from '../../../core/services/goals.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { Goal } from '../../../core/models/goal.model';
import { Employee } from '../../../core/models/employee.model';
import { GoalPriority, GoalStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './goal-list.html',
  styleUrl: './goal-list.scss',
})
export class GoalList {
  private readonly goalsService = inject(GoalsService);
  private readonly employeesService = inject(EmployeesService);

  readonly displayedColumns = ['title', 'employee', 'priority', 'dueDate', 'progress', 'status'];
  readonly goalStatuses = Object.values(GoalStatus);
  readonly goalPriorities = Object.values(GoalPriority);

  readonly isLoading = signal(true);
  readonly goals = signal<Goal[]>([]);
  readonly employeeMap = signal<Map<string, Employee>>(new Map());

  readonly selectedStatus = signal<GoalStatus | ''>('');
  readonly selectedPriority = signal<GoalPriority | ''>('');

  readonly filteredGoals = computed(() => {
    const status = this.selectedStatus();
    const priority = this.selectedPriority();
    return this.goals().filter((goal) => {
      const matchesStatus = !status || goal.status === status;
      const matchesPriority = !priority || goal.priority === priority;
      return matchesStatus && matchesPriority;
    });
  });

  readonly totalGoals = computed(() => this.goals().length);
  readonly completedGoals = computed(() => this.goals().filter((g) => g.status === GoalStatus.COMPLETED).length);
  readonly inProgressGoals = computed(() => this.goals().filter((g) => g.status === GoalStatus.IN_PROGRESS).length);
  readonly atRiskGoals = computed(() => this.goals().filter((g) => g.status === GoalStatus.AT_RISK).length);

  readonly today = new Date().toISOString().split('T')[0];

  constructor() {
    this.goalsService.findAll().subscribe({
      next: (data) => {
        this.goals.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

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

  getEmployeeName(employeeId: string): string {
    const emp = this.employeeMap().get(employeeId);
    return emp ? emp.fullName : employeeId;
  }

  isPastDue(dueDate: string): boolean {
    return dueDate < this.today;
  }

  priorityColor(p: GoalPriority): string {
    switch (p) {
      case GoalPriority.HIGH:
        return 'text-error!';
      case GoalPriority.MEDIUM:
        return 'text-warning!';
      case GoalPriority.LOW:
        return 'text-on-surface-variant';
      default:
        return 'text-on-surface-variant';
    }
  }

  statusColor(s: GoalStatus): string {
    switch (s) {
      case GoalStatus.COMPLETED:
        return 'text-green-600';
      case GoalStatus.IN_PROGRESS:
        return 'text-blue-600';
      case GoalStatus.AT_RISK:
        return 'text-error!';
      case GoalStatus.NOT_STARTED:
        return 'text-on-surface-variant';
      default:
        return 'text-on-surface-variant';
    }
  }
}
