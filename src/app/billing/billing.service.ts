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

  public getAllBillings(): Observable<BillingModel[]> {
    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllBillings`);
  }

  public getAllBillingsByCustomerId(customerId: number): Observable<BillingModel[]> {
    let params = new HttpParams().append('customerId', customerId.toString());
    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllBillingsByCustomerId`, { params: params });
  }

  public getAllLoanBillings(): Observable<BillingModel[]> {
    return this.httpClient.get<BillingModel[]>(`${environment.apiUrl}/billing/getAllLoanBillings`);
  }

  public getMaxId(sessionYear: number): Observable<BillingModel> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<BillingModel>(`${environment.apiUrl}/billing/getMaxId`, { params: params });
  }

  deleteBilling(id: string): Observable<BillingModel> {
    return this.httpClient.delete<BillingModel>(`${environment.apiUrl}/billing/deleteBilling/${id}`);
  }

  approveBilling(id: number, staffId: number): Observable<BillingModel> {
    let params = new HttpParams().append('id', id.toString()).append('staffId', staffId.toString());
    return this.httpClient.get<BillingModel>(`${environment.apiUrl}/billing/approveBilling`, { params: params });
  }

  public getAllProductQuantity(): Observable<number[][]> {
    return this.httpClient.get<number[][]>(`${environment.apiUrl}/billing/getAllBillingProductQuantity`);
  }

}
