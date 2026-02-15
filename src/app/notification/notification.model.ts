export class NotificationModel {
  id: number;
  notificationName: string;
  notificationType: string;
  createdBy: number;
  publishedOn: string;
}

export class NotificationRequestModel {
  notificationModel: NotificationModel;
  classId: number;
  sectionId: number;
  customerIds: number[];
  userIds: number[];
}

export class NotificationResponseModel {
  notification: NotificationModel;
  isRead: boolean;
}

