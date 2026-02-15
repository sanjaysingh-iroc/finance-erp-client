import { Injectable } from '@angular/core';
import { CustomerLeadModel, SolarCustomerModel } from './customer-lead.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerLeadService {

  constructor(private httpClient: HttpClient) {
  }

  addNewCustomerLead(customer: CustomerLeadModel): Observable<CustomerLeadModel> {
    return this.httpClient.post<CustomerLeadModel>(`${environment.apiUrl}/customerLead/create`, customer);
  }

  public getAllCustomerLeads(): Observable<CustomerLeadModel[]> {
    return this.httpClient.get<CustomerLeadModel[]>(`${environment.apiUrl}/customerLead/getAllCustomerLeads`);
  }

  deleteCustomerLead(id: string): Observable<CustomerLeadModel> {
    return this.httpClient.delete<CustomerLeadModel>(`${environment.apiUrl}/customerLead/deleteCustomerLead/${id}`);
  }

  getCustomerLead(id: number): Observable<CustomerLeadModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<CustomerLeadModel>(`${environment.apiUrl}/customerLead/getCustomerLead`, { params: params });
  }

  getAllCustomerLeadDetailsByDate(activityDate: string): Observable<CustomerLeadModel[]> {
    let params = new HttpParams().append('activityDate', activityDate);
    return this.httpClient.get<CustomerLeadModel[]>(`${environment.apiUrl}/customerLead/getCustomerLeadsByDate`, { params: params });
  }

  addNewSolarCustomer(customer: SolarCustomerModel): Observable<SolarCustomerModel> {
    return this.httpClient.post<SolarCustomerModel>(`${environment.apiUrl}/customerLead/createNewSolarCustomer`, customer);
  }

  public getAllSolarCustomers(): Observable<SolarCustomerModel[]> {
    return this.httpClient.get<SolarCustomerModel[]>(`${environment.apiUrl}/customerLead/getAllSolarCustomers`);
  }

  deleteSolarCustomer(id: string): Observable<SolarCustomerModel> {
    return this.httpClient.delete<SolarCustomerModel>(`${environment.apiUrl}/customerLead/deleteSolarCustomer/${id}`);
  }

  uploadCustomerImage(uploadImageData: FormData): Observable<UploadFileModel> {
      return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/customerLead/uploadFile`, uploadImageData);
    }
}
