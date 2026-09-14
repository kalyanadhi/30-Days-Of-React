import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsService } from '../../../core/services/notifications.service';
import { AppNotification } from '../../../core/models/notification.model';
import { NotificationType } from '../../../core/models/enums';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss',
})
export class NotificationCenter {
  private readonly notificationsService = inject(NotificationsService);

  readonly isLoading = signal(true);
  readonly notifications = signal<AppNotification[]>([]);
  readonly filterUnread = signal(false);

  readonly filtered = computed(() => {
    const items = this.notifications();
    return this.filterUnread() ? items.filter((n) => !n.isRead) : items;
  });

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);

  constructor() {
    this.load();
  }

  private load(): void {
    this.notificationsService.findAll().subscribe({
      next: (items) => {
        this.notifications.set(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  markRead(notification: AppNotification): void {
    if (notification.isRead) return;
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: (updated) => {
        this.notifications.update((items) => items.map((n) => (n.id === updated.id ? updated : n)));
      },
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((items) => items.map((n) => ({ ...n, isRead: true })));
      },
    });
  }

  toggleFilter(): void {
    this.filterUnread.update((v) => !v);
  }

  typeIcon(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      [NotificationType.PENDING_REVIEW]: 'rate_review',
      [NotificationType.GOAL_DEADLINE]: 'flag',
      [NotificationType.PROMOTION_REVIEW]: 'trending_up',
      [NotificationType.MISSING_ONE_ON_ONE]: 'forum',
      [NotificationType.LEARNING_EXPIRY]: 'menu_book',
      [NotificationType.CERTIFICATION_EXPIRY]: 'workspace_premium',
    };
    return map[type] ?? 'notifications';
  }

  typeColor(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      [NotificationType.PENDING_REVIEW]: 'text-blue-600',
      [NotificationType.GOAL_DEADLINE]: 'text-warning!',
      [NotificationType.PROMOTION_REVIEW]: 'text-green-600',
      [NotificationType.MISSING_ONE_ON_ONE]: 'text-purple-600',
      [NotificationType.LEARNING_EXPIRY]: 'text-amber-500',
      [NotificationType.CERTIFICATION_EXPIRY]: 'text-orange-600',
    };
    return map[type] ?? 'text-on-surface-variant';
  }

  typeLabel(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      [NotificationType.PENDING_REVIEW]: 'Pending Review',
      [NotificationType.GOAL_DEADLINE]: 'Goal Deadline',
      [NotificationType.PROMOTION_REVIEW]: 'Promotion Review',
      [NotificationType.MISSING_ONE_ON_ONE]: 'Missing 1:1',
      [NotificationType.LEARNING_EXPIRY]: 'Learning Expiry',
      [NotificationType.CERTIFICATION_EXPIRY]: 'Cert Expiry',
    };
    return map[type] ?? type;
  }
}
