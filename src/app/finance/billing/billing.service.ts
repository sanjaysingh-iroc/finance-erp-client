import { Injectable } from '@angular/core';
import { BillingModel } from './billing.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private httpClient: HttpClient) {
  }

  addNewBilling(billing: BillingModel): Observable<BillingModel> {
    return this.httpClient.post<BillingModel>(`${environment.apiUrl}/billing/create`, billing);
  }

  public getAllBillings(companyId: number, sessionYear: number): Observable<BillingModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('sessionYear', sessionYear.toString());

    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllBillings`, { params: params });
  }

  public getAllBillingsByCustomerId(companyId: number, customerId: number): Observable<BillingModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('customerId', customerId.toString());
    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllBillingsByCustomerId`, { params: params });
  }

  public getAllLoanBillings(companyId: number,): Observable<BillingModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllLoanBillings`, { params: params });
  }

  // public getMaxId(companyId: number,sessionYear: number): Observable<BillingModel> {
  //   let params = new HttpParams().append('companyId', companyId.toString()).append('sessionYear', sessionYear.toString());
  //   return this.httpClient.get<BillingModel>(`${environment.apiUrl}/billing/getMaxId`, { params: params });
  // }

  deleteBilling(id: string): Observable<BillingModel> {
    return this.httpClient.delete<BillingModel>(`${environment.apiUrl}/billing/deleteBilling/${id}`);
  }

  approveBilling(id: number, staffId: number): Observable<BillingModel> {
    let params = new HttpParams().append('id', id.toString()).append('staffId', staffId.toString());
    return this.httpClient.get<BillingModel>(`${environment.apiUrl}/billing/approveBilling`, { params: params });
  }

  public getAllProductQuantity(companyId: number,): Observable<number[][]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<number[][]>(`${environment.apiUrl}/billing/getAllBillingProductQuantity`, { params: params });
  }





}
