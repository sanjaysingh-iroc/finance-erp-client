import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AnnouncementModel } from './announcement.model';
import { HttpClient } from '@angular/common/http';

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

  public getAllActiveAnnouncements(): Observable<AnnouncementModel[]> {
    return this.httpClient.get<AnnouncementModel[]>(`${environment.apiUrl}/announcement/getAllAnnouncement`);
  }
}
