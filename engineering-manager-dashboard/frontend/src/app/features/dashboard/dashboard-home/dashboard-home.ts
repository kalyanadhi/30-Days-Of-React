import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { ThemeService } from '../../../core/services/theme.service';
import { DashboardDistributions, DashboardSummary } from '../../../core/models/dashboard.model';
import { Role } from '../../../core/models/enums';

interface SummaryCard {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
}

interface QuickLink {
  label: string;
  description: string;
  icon: string;
  route: string;
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'My Evaluations', description: 'Review your quarterly performance evaluations', icon: 'assessment', route: '/evaluations' },
  { label: 'Goals & OKRs', description: 'Track progress on your goals and objectives', icon: 'flag', route: '/goals' },
  { label: 'Achievements', description: 'View recognitions and milestones', icon: 'military_tech', route: '/achievements' },
  { label: 'Development Plans', description: 'See your active growth plans', icon: 'school', route: '/development-plans' },
  { label: '1:1 Meetings', description: 'Browse your meeting history and action items', icon: 'forum', route: '/one-on-ones' },
  { label: 'Learning', description: 'Track trainings and certifications', icon: 'menu_book', route: '/learning' },
];

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule, NgxEchartsDirective],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome {
  private readonly dashboardService = inject(DashboardService);
  private readonly authStore = inject(AuthStore);
  private readonly themeService = inject(ThemeService);

  readonly user = this.authStore.user;
  readonly quickLinks = QUICK_LINKS;

  readonly isManager = computed(() => {
    const role = this.authStore.role();
    return role === Role.ENGINEERING_MANAGER || role === Role.DIRECTOR;
  });

  readonly chartTheme = computed<string>(() => (this.themeService.theme() === 'dark' ? 'dark' : 'default'));

  readonly isLoading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly distributions = signal<DashboardDistributions | null>(null);

  readonly summaryCards = computed<SummaryCard[]>(() => {
    const summary = this.summary();
    if (!summary) {
      return [];
    }

    return [
      { label: 'Total Team Members', value: `${summary.totalTeamMembers}`, icon: 'groups', colorClass: 'text-primary' },
      { label: 'High Performers', value: `${summary.highPerformers}`, icon: 'star', colorClass: 'text-success' },
      { label: 'Promotion Ready', value: `${summary.promotionReady}`, icon: 'trending_up', colorClass: 'text-tertiary' },
      { label: 'Employees at Risk', value: `${summary.employeesAtRisk}`, icon: 'warning', colorClass: 'text-error' },
      { label: 'Avg Team Rating', value: summary.averageTeamRating.toFixed(2), icon: 'insights', colorClass: 'text-primary' },
      { label: 'Open Development Plans', value: `${summary.openDevelopmentPlans}`, icon: 'school', colorClass: 'text-warning' },
      { label: 'Upcoming Reviews', value: `${summary.upcomingReviews}`, icon: 'event', colorClass: 'text-secondary' },
    ];
  });

  readonly ratingDistributionOptions = computed<EChartsCoreOption>(() => {
    const data = this.distributions()?.ratingDistribution ?? [];
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: 'Rating Distribution',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 4 },
          data: data.map((item) => ({ name: item.band, value: item.count })),
        },
      ],
    };
  });

  readonly performanceTrendOptions = computed<EChartsCoreOption>(() => {
    const data = this.distributions()?.performanceTrend ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.map((item) => item.period) },
      yAxis: { type: 'value', min: 0, max: 5 },
      series: [
        {
          name: 'Average Score',
          type: 'line',
          smooth: true,
          areaStyle: {},
          data: data.map((item) => item.averageScore),
        },
      ],
    };
  });

  readonly promotionReadinessOptions = computed<EChartsCoreOption>(() => {
    const data = this.distributions()?.promotionReadiness ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.map((item) => item.band), axisLabel: { interval: 0 } },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Employees',
          type: 'bar',
          data: data.map((item) => item.count),
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  });

  readonly skillMatrixOptions = computed<EChartsCoreOption>(() => {
    const data = this.distributions()?.skillMatrix ?? [];
    return {
      tooltip: {},
      radar: {
        indicator: data.map((item) => ({ name: item.category, max: 5 })),
      },
      series: [
        {
          name: 'Skill Matrix',
          type: 'radar',
          data: [{ value: data.map((item) => item.averageScore), name: 'Average Score' }],
        },
      ],
    };
  });

  readonly experienceDistributionOptions = computed<EChartsCoreOption>(() => {
    const data = this.distributions()?.experienceDistribution ?? [];
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: 'Experience Distribution',
          type: 'pie',
          radius: '70%',
          data: data.map((item) => ({ name: item.range, value: item.count })),
        },
      ],
    };
  });

  constructor() {
    if (this.isManager()) {
      this.loadManagerData();
    } else {
      this.isLoading.set(false);
    }
  }

  private loadManagerData(): void {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => this.summary.set(null),
    });

    this.dashboardService.getDistributions().subscribe({
      next: (distributions) => {
        this.distributions.set(distributions);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
