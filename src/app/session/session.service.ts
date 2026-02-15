import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SessionModel } from './session.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private httpClient: HttpClient) {
  }

  addNewSession(sessionModel: SessionModel): Observable<SessionModel> {
    return this.httpClient.post<SessionModel>(`${environment.apiUrl}/session/create`, sessionModel);
  }

  deleteSession(id: string): Observable<SessionModel> {
    return this.httpClient.delete<SessionModel>(`${environment.apiUrl}/session/deleteSession/${id}`);
  }

  updateCurrentSessionYear(sessionModels: SessionModel[]): Observable<SessionModel[]> {
    return this.httpClient.post<SessionModel[]>(`${environment.apiUrl}/session/updateSessionYears`, sessionModels);
  }

  getAllCurrentAndUpcomingSessionYears(): Observable<SessionModel[]> {
    return this.httpClient.get<SessionModel[]>(`${environment.apiUrl}/session/getAllCurrentAndUpcomingSessionYears`);
  }

  getAllUpcomingSessionYears(): Observable<SessionModel> {
    return this.httpClient.get<SessionModel>(`${environment.apiUrl}/session/getAllUpcomingSessionYears`);
  }

  getAllSessionYears(): Observable<SessionModel[]> {
    return this.httpClient.get<SessionModel[]>(`${environment.apiUrl}/session/getAllSessionYears`);
  }

  getAllAroundSessionYears(): Observable<SessionModel[]> {
    return this.httpClient.get<SessionModel[]>(`${environment.apiUrl}/session/getAllAroundSessionYears`);
  }

  getAllCurrentAndPreviousSessionYears(): Observable<SessionModel[]> {
    return this.httpClient.get<SessionModel[]>(`${environment.apiUrl}/session/getAllCurrentAndPreviousSessionYears`);
  }

}
