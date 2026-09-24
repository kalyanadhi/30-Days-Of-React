import { NotificationType } from './enums';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedEntityId: string | null;
  isRead: boolean;
  dueDate: string | null;
  createdAt: string;
}
