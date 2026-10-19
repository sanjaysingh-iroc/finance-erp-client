import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, Subject } from 'rxjs';
import { CompanyModel, AclInfoModel, RouteInfoModel, UpdateAclInfoModel } from './company.model';
import { UploadFileModel } from '../shared/common.models';
@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  observer = new Subject<CompanyModel>();
  public subscriber$ = this.observer.asObservable();

  constructor(private httpClient: HttpClient) {
  }

  emitData(data) {
    this.observer.next(data);
  }

  addNewCompany(company: CompanyModel): Observable<CompanyModel> {
    return this.httpClient.post<CompanyModel>(`${environment.apiUrl}/company/create`, company);
  }

  public getCompanyDetails(companyId: number): Observable<CompanyModel> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<CompanyModel>(`${environment.apiUrl}/company/getCompanyDetails`, { params: params });
  }

  public getAllCompanyDetails(): Observable<CompanyModel[]> {
    return this.httpClient.get<CompanyModel[]>(`${environment.apiUrl}/company/getAllCompanyDetails`);
  }

  uploadCompanyLogo(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/company/uploadFile`, uploadImageData);
  }

  public getAllNavigationDetails(): Observable<RouteInfoModel[]> {
    return this.httpClient.get<RouteInfoModel[]>(`${environment.apiUrl}/company/getAllNavigationDetails`);
  }
  public getAllNavigationAclDetails(userTypeId: number, companyId: number): Observable<AclInfoModel[]> {
    let params = new HttpParams().append('userTypeId', userTypeId.toString()).append('companyId', companyId.toString());
    return this.httpClient.get<AclInfoModel[]>(`${environment.apiUrl}/company/getAllNavigationAclDetails`, { params: params });
  }

  public updateNavigationAclDetails(UpdateAclInfoModel: UpdateAclInfoModel): Observable<UpdateAclInfoModel> {
    return this.httpClient.post<UpdateAclInfoModel>(`${environment.apiUrl}/company/updateNavigationAclDetails`, UpdateAclInfoModel);
  }
}
