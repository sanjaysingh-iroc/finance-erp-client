import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, } from 'rxjs';
import { DashboardAclModel, DashboardModel, UpdateDashboardAclModel } from './dashboard.model';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient: HttpClient) {
  }


  public getAllDashboardDetails(): Observable<DashboardModel[]> {
    return this.httpClient.get<DashboardModel[]>(`${environment.apiUrl}/company/getAllDashboardDetails`);
  }
  public getAllDashboardAclDetails(userTypeId: number): Observable<DashboardAclModel[]> {
    let params = new HttpParams().append('userTypeId', userTypeId.toString());
    return this.httpClient.get<DashboardAclModel[]>(`${environment.apiUrl}/company/getAllDashboardAclDetails`, { params: params });
  }

  public updateDashboardAclDetails(updateDashboardAclModel: UpdateDashboardAclModel): Observable<UpdateDashboardAclModel> {
    return this.httpClient.post<UpdateDashboardAclModel>(`${environment.apiUrl}/company/updateDashboardAclDetails`, updateDashboardAclModel);
  }
}
