import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/enums';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home').then((m) => m.DashboardHome),
      },
      {
        path: 'employees',
        canActivate: [roleGuard([Role.ENGINEERING_MANAGER, Role.DIRECTOR])],
        loadComponent: () => import('./features/employees/employee-list/employee-list').then((m) => m.EmployeeList),
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./features/employees/employee-profile/employee-profile').then((m) => m.EmployeeProfile),
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./features/evaluations/evaluation-list/evaluation-list').then((m) => m.EvaluationList),
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/goals/goal-list/goal-list').then((m) => m.GoalList),
      },
      {
        path: 'achievements',
        loadComponent: () => import('./features/achievements/achievement-list/achievement-list').then((m) => m.AchievementList),
      },
      {
        path: 'development-plans',
        loadComponent: () => import('./features/development-plans/development-plan-list/development-plan-list').then((m) => m.DevelopmentPlanList),
      },
      {
        path: 'one-on-ones',
        loadComponent: () => import('./features/one-on-ones/one-on-one-list/one-on-one-list').then((m) => m.OneOnOneList),
      },
      {
        path: 'learning',
        loadComponent: () => import('./features/learning/learning-list/learning-list').then((m) => m.LearningList),
      },
      {
        path: 'promotion-readiness',
        canActivate: [roleGuard([Role.ENGINEERING_MANAGER, Role.DIRECTOR])],
        loadComponent: () => import('./features/promotion-readiness/promotion-readiness-page/promotion-readiness-page').then((m) => m.PromotionReadinessPage),
      },
      {
        path: 'talent-matrix',
        canActivate: [roleGuard([Role.ENGINEERING_MANAGER, Role.DIRECTOR])],
        loadComponent: () => import('./features/talent-matrix/talent-matrix-page/talent-matrix-page').then((m) => m.TalentMatrixPage),
      },
      {
        path: 'risk',
        canActivate: [roleGuard([Role.ENGINEERING_MANAGER, Role.DIRECTOR])],
        loadComponent: () => import('./features/risk/risk-dashboard/risk-dashboard').then((m) => m.RiskDashboard),
      },
      {
        path: 'reports',
        canActivate: [roleGuard([Role.ENGINEERING_MANAGER, Role.DIRECTOR])],
        loadComponent: () => import('./features/reports/reports-page/reports-page').then((m) => m.ReportsPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-center/notification-center').then((m) => m.NotificationCenter),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
