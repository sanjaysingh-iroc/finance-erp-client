import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {  CountryModel, GroupModel, IdProofModel, PaymentFrequencyModel, PaymentTypeModel, PdfStyleModel,  SerialKeyModel, SettingModel, StateModel, UploadFileModel, UserTypeModel, WeeklyOffModel } from '../common.models';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private httpClient: HttpClient) {
  }

  getAllPaymentType(): Observable<PaymentTypeModel[]> {
    return this.httpClient.get<PaymentTypeModel[]>(`${environment.apiUrl}/utils/getPaymentTypes`);
  }

   getAllPaymentFrequency(): Observable<PaymentFrequencyModel[]> {
    return this.httpClient.get<PaymentFrequencyModel[]>(`${environment.apiUrl}/utils/getAllPaymentFrequency`);
  }

   getAllGroupDetails(): Observable<GroupModel[]> {
    return this.httpClient.get<GroupModel[]>(`${environment.apiUrl}/utils/getAllGroupDetails`);
  }


  getAllSettings(): Observable<SettingModel[]> {
    return this.httpClient.get<SettingModel[]>(`${environment.apiUrl}/utils/getSettings`);
  }

  getAllUserType(): Observable<UserTypeModel[]> {
    return this.httpClient.get<UserTypeModel[]>(`${environment.apiUrl}/utils/getUserType`);
  }


  getWeeklyOff(): Observable<WeeklyOffModel[]> {
    return this.httpClient.get<WeeklyOffModel[]>(`${environment.apiUrl}/utils/getAllWeeklyOff`);
  }


  getIdProofType(): Observable<IdProofModel[]> {
    return this.httpClient.get<IdProofModel[]>(`${environment.apiUrl}/utils/getIdProofDetails`);
  }

  getPdfStyles(): Observable<PdfStyleModel[]> {
    return this.httpClient.get<PdfStyleModel[]>(`${environment.apiUrl}/utils/getPdfStyles`);
  }

  getCountry(): Observable<CountryModel[]> {
    return this.httpClient.get<CountryModel[]>(`${environment.apiUrl}/utils/getCountry`);
  }

  getStates(countryId: number): Observable<StateModel[]> {
    let params = new HttpParams().append('countryId', countryId.toString());
    return this.httpClient.get<StateModel[]>(`${environment.apiUrl}/utils/getStates`, { params: params });
  }

  uploadFile(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/utils/uploadFile`, uploadImageData);
  }

  getSerialKey(companyId: number, sessionId: number): Observable<SerialKeyModel> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('sessionId', sessionId.toString());
    return this.httpClient.get<SerialKeyModel>(`${environment.apiUrl}/utils/getSerialKey`, { params: params });
  }

  updateSerialKey(serialKeyModel: SerialKeyModel): Observable<SerialKeyModel> {
    return this.httpClient.post<SerialKeyModel>(`${environment.apiUrl}/utils/updateSerialKey`, serialKeyModel);
  }

}
