import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeesService } from '../../../core/services/employees.service';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { GoalsService } from '../../../core/services/goals.service';
import { OneOnOnesService } from '../../../core/services/one-on-ones.service';
import { DevelopmentPlansService } from '../../../core/services/development-plans.service';
import { AchievementsService } from '../../../core/services/achievements.service';
import { LearningService } from '../../../core/services/learning.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { Employee } from '../../../core/models/employee.model';
import { PerformanceEvaluation, CATEGORY_LABELS } from '../../../core/models/evaluation.model';
import { Goal } from '../../../core/models/goal.model';
import { OneOnOne } from '../../../core/models/one-on-one.model';
import { DevelopmentPlan } from '../../../core/models/development-plan.model';
import { Achievement } from '../../../core/models/achievement.model';
import { LearningActivity } from '../../../core/models/learning.model';
import {
  AchievementCategory,
  GoalPriority,
  GoalStatus,
  LearningCompletionStatus,
  RatingBand,
  Role,
} from '../../../core/models/enums';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.scss',
})
export class EmployeeProfile implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly goalsService = inject(GoalsService);
  private readonly oneOnOnesService = inject(OneOnOnesService);
  private readonly devPlansService = inject(DevelopmentPlansService);
  private readonly achievementsService = inject(AchievementsService);
  private readonly learningService = inject(LearningService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly isLoading = signal(true);
  readonly employee = signal<Employee | null>(null);
  readonly error = signal<string | null>(null);

  readonly evaluations = signal<PerformanceEvaluation[]>([]);
  readonly goals = signal<Goal[]>([]);
  readonly oneOnOnes = signal<OneOnOne[]>([]);
  readonly devPlans = signal<DevelopmentPlan[]>([]);
  readonly achievements = signal<Achievement[]>([]);
  readonly learnings = signal<LearningActivity[]>([]);

  readonly CATEGORY_LABELS = CATEGORY_LABELS;
  readonly GoalStatus = GoalStatus;
  readonly GoalPriority = GoalPriority;
  readonly AchievementCategory = AchievementCategory;
  readonly LearningCompletionStatus = LearningCompletionStatus;

  readonly evalColumns = ['quarter', 'delivery', 'technical', 'quality', 'collaboration', 'learning', 'overall', 'rating'];
  readonly goalColumns = ['title', 'dueDate', 'priority', 'progress', 'status'];
  readonly oo1Columns = ['date', 'notes', 'actionItems', 'followUp'];
  readonly planColumns = ['title', 'targetSkills', 'targetDate', 'status'];
  readonly learningColumns = ['training', 'skillArea', 'hours', 'status', 'expiry'];

  readonly isManager = computed(() => {
    const role = this.authStore.role();
    return role === Role.ENGINEERING_MANAGER || role === Role.DIRECTOR;
  });

  readonly initials = computed(() => {
    const name = this.employee()?.fullName ?? '';
    return name.split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase();
  });

  readonly activeGoalCount = computed(() =>
    this.goals().filter((g) => g.status !== GoalStatus.COMPLETED).length,
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.employeesService.findOne(this.id()).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.isLoading.set(false);
        this.loadTabData();
      },
      error: () => {
        this.error.set('Unable to load this employee profile.');
        this.isLoading.set(false);
      },
    });
  }

  private loadTabData(): void {
    const id = this.id();

    this.evaluationsService.findByEmployee(id).subscribe({
      next: (data) =>
        this.evaluations.set(
          [...data].sort((a, b) => b.year - a.year || b.quarter.localeCompare(a.quarter)),
        ),
      error: () => {},
    });

    this.goalsService.findByEmployee(id).subscribe({
      next: (data) => this.goals.set(data),
      error: () => {},
    });

    this.oneOnOnesService.findByEmployee(id).subscribe({
      next: (data) =>
        this.oneOnOnes.set(
          [...data].sort(
            (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
          ),
        ),
      error: () => {},
    });

    this.devPlansService.findByEmployee(id).subscribe({
      next: (data) => this.devPlans.set(data),
      error: () => {},
    });

    this.achievementsService.findByEmployee(id).subscribe({
      next: (data) =>
        this.achievements.set(
          [...data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
      error: () => {},
    });

    this.learningService.findByEmployee(id).subscribe({
      next: (data) => this.learnings.set(data),
      error: () => {},
    });
  }

  ratingColor(band: RatingBand): string {
    switch (band) {
      case RatingBand.OUTSTANDING: return 'text-green-600';
      case RatingBand.EXCEEDS_EXPECTATIONS: return 'text-blue-600';
      case RatingBand.MEETS_EXPECTATIONS: return 'text-on-surface';
      case RatingBand.NEEDS_IMPROVEMENT: return 'text-warning!';
      case RatingBand.UNSATISFACTORY: return 'text-error!';
    }
  }

  goalStatusColor(status: GoalStatus): string {
    switch (status) {
      case GoalStatus.COMPLETED: return 'text-green-600';
      case GoalStatus.IN_PROGRESS: return 'text-blue-600';
      case GoalStatus.AT_RISK: return 'text-error!';
      case GoalStatus.NOT_STARTED: return 'text-on-surface-variant';
    }
  }

  priorityColor(priority: GoalPriority): string {
    switch (priority) {
      case GoalPriority.HIGH: return 'text-error!';
      case GoalPriority.MEDIUM: return 'text-warning!';
      case GoalPriority.LOW: return 'text-on-surface-variant';
    }
  }

  achievementIcon(cat: AchievementCategory): string {
    const map: Record<AchievementCategory, string> = {
      [AchievementCategory.DELIVERY]: 'local_shipping',
      [AchievementCategory.TECHNICAL]: 'code',
      [AchievementCategory.LEADERSHIP]: 'supervisor_account',
      [AchievementCategory.CUSTOMER_APPRECIATION]: 'star',
      [AchievementCategory.INNOVATION]: 'lightbulb',
      [AchievementCategory.PROCESS_IMPROVEMENT]: 'build',
    };
    return map[cat] ?? 'military_tech';
  }

  learningStatusColor(status: LearningCompletionStatus): string {
    switch (status) {
      case LearningCompletionStatus.COMPLETED: return 'text-green-600';
      case LearningCompletionStatus.IN_PROGRESS: return 'text-blue-600';
      case LearningCompletionStatus.NOT_STARTED: return 'text-on-surface-variant';
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

  isPastDue(dueDate: string, status: GoalStatus): boolean {
    return status !== GoalStatus.COMPLETED && new Date(dueDate).getTime() < Date.now();
  }

  goBack(): void {
    void this.router.navigate(['/employees']);
  }
}
