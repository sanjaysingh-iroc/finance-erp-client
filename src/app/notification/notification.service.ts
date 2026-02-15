import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { NotificationModel, NotificationRequestModel, NotificationResponseModel } from './notification.model';
import { first } from 'rxjs/operators';
import { LocalStorageData } from '../shared/local-storage-data';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  observer = new Subject<number[]>();
  public subscriber$ = this.observer.asObservable();

  emitData(data) {
    this.observer.next(data);
  }
  constructor(
    private httpClient: HttpClient,
    private localStorageData: LocalStorageData,
  ) {
  }


  sendCustomerNotification(notificationName: string, notificationType: string, customerIds: number[] = null) {
    const user = this.localStorageData.userValue;
    const notificationRequestModel: NotificationRequestModel = new NotificationRequestModel();
    const notificationModel: NotificationModel = new NotificationModel();
    notificationModel.notificationName = notificationName;
    notificationModel.notificationType = notificationType;
    notificationModel.createdBy = user.id;
    notificationRequestModel.notificationModel = notificationModel;
    notificationRequestModel.customerIds = customerIds;
    this.addCustomerNotification(notificationRequestModel)
      .pipe(first())
      .subscribe(
        data => {

        });
  }

  sendUserNotification(notificationName: string, notificationType: string, userIds: number[] = null) {
    const user = this.localStorageData.userValue;
    const notificationRequestModel: NotificationRequestModel = new NotificationRequestModel();
    const notificationModel: NotificationModel = new NotificationModel();
    notificationModel.notificationName = notificationName;
    notificationModel.notificationType = notificationType;
    notificationModel.createdBy = user.id;
    notificationRequestModel.notificationModel = notificationModel;
    notificationRequestModel.userIds = userIds;

    this.addUserNotification(notificationRequestModel)
      .pipe(first())
      .subscribe(
        data => {

        });
  }

  addCustomerNotification(notificationCreateModel: NotificationRequestModel): Observable<NotificationRequestModel> {
    return this.httpClient.post<NotificationRequestModel>(`${environment.apiUrl}/notification/createCustomerNotification`, notificationCreateModel);
  }

  addUserNotification(notificationCreateModel: NotificationRequestModel): Observable<NotificationRequestModel> {
    return this.httpClient.post<NotificationRequestModel>(`${environment.apiUrl}/notification/createUserNotification`, notificationCreateModel);
  }

  getNotificationDetailsLimit(customerId: number, userId: number): Observable<NotificationResponseModel[]> {
    let params = new HttpParams();
    if (customerId != undefined) {
      params = params.append('customerId', customerId.toString());
    } else if (userId != undefined) {
      params = params.append('userId', userId.toString());
    }
    return this.httpClient.get<NotificationResponseModel[]>(`${environment.apiUrl}/notification/getNotificationDetailsLimit`, { params: params });
  }

  getAllNotification(customerId: number, userId: number): Observable<NotificationResponseModel[]> {
    let params = new HttpParams();
    if (customerId != undefined) {
      params = params.append('customerId', customerId.toString());
    } else if (userId != undefined) {
      params = params.append('userId', userId.toString());
    }
    return this.httpClient.get<NotificationResponseModel[]>(`${environment.apiUrl}/notification/getNotificationDetails`, { params: params });
  }

  deleteNotifications(id: string, customerId: number, userId: number): Observable<number> {
    let params = new HttpParams();
    if (customerId != undefined) {
      params = params.append('customerId', customerId.toString());
    } else if (userId != undefined) {
      params = params.append('userId', userId.toString());
    }
    return this.httpClient.delete<number>(`${environment.apiUrl}/notification/deleteNotification/${id}`, { params: params });
  }
}
