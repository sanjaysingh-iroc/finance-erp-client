import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AnnouncementModel } from './announcement.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  constructor(private httpClient: HttpClient) {
  }


  addNewAnnouncement(announcementModel: AnnouncementModel): Observable<AnnouncementModel> {
    return this.httpClient.post<AnnouncementModel>(`${environment.apiUrl}/announcement/create`, announcementModel);
  }

  deleteAnnouncement(id: string): Observable<AnnouncementModel> {
    return this.httpClient.delete<AnnouncementModel>(`${environment.apiUrl}/announcement/deleteAnnouncement/${id}`);
  }

  public getAllActiveAnnouncements(companyId: number): Observable<AnnouncementModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<AnnouncementModel[]>(`${environment.apiUrl}/announcement/getAllAnnouncement`, { params: params });
  }
}
