import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { AuthStore } from '../../core/stores/auth.store';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly authStore = inject(AuthStore);
  private readonly themeService = inject(ThemeService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly user = this.authStore.user;
  readonly theme = this.themeService.theme;
  readonly unreadCount = signal(0);

  readonly isHandheld = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly navItems = computed(() => {
    const role = this.authStore.role();
    return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));
  });

  constructor() {
    this.notificationsService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => this.unreadCount.set(0),
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authStore.logout();
    void this.router.navigate(['/login']);
  }
}
