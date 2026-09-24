import { Role } from '../../core/models/enums';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR] },
  { label: 'Employees', icon: 'groups', route: '/employees', roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR] },
  { label: 'Evaluations', icon: 'assessment', route: '/evaluations' },
  { label: 'Goals & OKRs', icon: 'flag', route: '/goals' },
  { label: 'Achievements', icon: 'military_tech', route: '/achievements' },
  { label: 'Development Plans', icon: 'school', route: '/development-plans' },
  { label: '1:1 Meetings', icon: 'forum', route: '/one-on-ones' },
  { label: 'Learning', icon: 'menu_book', route: '/learning' },
  {
    label: 'Promotion Readiness',
    icon: 'trending_up',
    route: '/promotion-readiness',
    roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR],
  },
  {
    label: 'Talent Matrix',
    icon: 'grid_view',
    route: '/talent-matrix',
    roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR],
  },
  { label: 'Risk Dashboard', icon: 'warning', route: '/risk', roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR] },
  { label: 'Reports', icon: 'description', route: '/reports', roles: [Role.ENGINEERING_MANAGER, Role.DIRECTOR] },
];
