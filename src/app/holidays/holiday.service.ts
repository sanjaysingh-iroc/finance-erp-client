import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayModel } from './holiday.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  constructor(private httpClient: HttpClient) {
  }

  public getAllHolidays(sessionYear: number): Observable<HolidayModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<HolidayModel[]>(`${environment.apiUrl}/holiday/getAllHolidays`, { params: params });
  }

  addNewHoliday(holidayModel: HolidayModel): Observable<HolidayModel> {
    return this.httpClient.post<HolidayModel>(`${environment.apiUrl}/holiday/create`, holidayModel);
  }

  deleteHoliday(id: string): Observable<HolidayModel> {
    return this.httpClient.delete<HolidayModel>(`${environment.apiUrl}/holiday/deleteHoliday/${id}`);
  }

  public getAllUpcomimgHolidays(sessionYear: number): Observable<HolidayModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<HolidayModel[]>(`${environment.apiUrl}/holiday/getAllUpcomingHolidays`, { params: params });
  }

  public getAllHolidaysByMonthAndYear(month: number, year: number): Observable<HolidayModel[]> {
    let params = new HttpParams().append('month', month.toString()).append('year', year.toString());
    return this.httpClient.get<HolidayModel[]>(`${environment.apiUrl}/holiday/findAllHolidaysByMonthAndYear`, { params: params });
  }

}
