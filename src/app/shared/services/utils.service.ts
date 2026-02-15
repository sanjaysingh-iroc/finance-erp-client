import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { BrandModel, CountryModel, GenderModel, IdProofModel, PaymentTypeModel, PdfStyleModel, ProductCategoryModel, SettingModel, StateModel, UserTypeModel, WeeklyOffModel } from '../common.models';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private httpClient: HttpClient) {
  }

  getAllPaymentType(): Observable<PaymentTypeModel[]> {
    return this.httpClient.get<PaymentTypeModel[]>(`${environment.apiUrl}/utils/getPaymentTypes`);
  }

  getAllGender(): Observable<GenderModel[]> {
    return this.httpClient.get<GenderModel[]>(`${environment.apiUrl}/utils/getGenders`);
  }

  getAllSettings(): Observable<SettingModel[]> {
    return this.httpClient.get<SettingModel[]>(`${environment.apiUrl}/utils/getSettings`);
  }

  getAllProductCategory(): Observable<ProductCategoryModel[]> {
    return this.httpClient.get<ProductCategoryModel[]>(`${environment.apiUrl}/utils/getProductCategory`);
  }

  getAllUserType(): Observable<UserTypeModel[]> {
    return this.httpClient.get<UserTypeModel[]>(`${environment.apiUrl}/utils/getUserType`);
  }

 
  getWeeklyOff(): Observable<WeeklyOffModel[]> {
    return this.httpClient.get<WeeklyOffModel[]>(`${environment.apiUrl}/utils/getAllWeeklyOff`);
  }

  getBrandDetails(): Observable<BrandModel[]> {
    return this.httpClient.get<BrandModel[]>(`${environment.apiUrl}/utils/getBrands`);
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

}
