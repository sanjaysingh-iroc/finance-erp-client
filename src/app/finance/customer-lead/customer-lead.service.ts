import { Injectable } from '@angular/core';
import { CustomerLeadModel } from './customer-lead.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerLeadService {

  constructor(private httpClient: HttpClient) {
  }

  addNewCustomerLead(customer: CustomerLeadModel): Observable<CustomerLeadModel> {
    return this.httpClient.post<CustomerLeadModel>(`${environment.apiUrl}/customerLead/create`, customer);
  }

  public getAllCustomerLeads(companyId: number,): Observable<CustomerLeadModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<CustomerLeadModel[]>(`${environment.apiUrl}/customerLead/getAllCustomerLeads`, { params: params });
  }

  deleteCustomerLead(id: string): Observable<CustomerLeadModel> {
    return this.httpClient.delete<CustomerLeadModel>(`${environment.apiUrl}/customerLead/deleteCustomerLead/${id}`);
  }

  getCustomerLead(id: number): Observable<CustomerLeadModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<CustomerLeadModel>(`${environment.apiUrl}/customerLead/getCustomerLead`, { params: params });
  }

  getAllCustomerLeadDetailsByDate(companyId: number, activityDate: string): Observable<CustomerLeadModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('activityDate', activityDate);
    return this.httpClient.get<CustomerLeadModel[]>(`${environment.apiUrl}/customerLead/getCustomerLeadsByDate`, { params: params });
  }

}
