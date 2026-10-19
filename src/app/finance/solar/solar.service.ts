import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SolarBillingModel, SolarCustomerModel, SolarProductInventoryModel, SolarProductMinimumModel } from './solar-billing.model';

@Injectable({
  providedIn: 'root'
})
export class SolarService {

  constructor(private httpClient: HttpClient) {
  }

  addNewSolarCustomer(customer: SolarCustomerModel): Observable<SolarCustomerModel> {
    return this.httpClient.post<SolarCustomerModel>(`${environment.apiUrl}/solarBilling/createNewSolarCustomer`, customer);
  }

  public getAllActiveSolarCustomers(companyId: number,isComplete: boolean): Observable<SolarCustomerModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('isComplete', isComplete.toString());
    return this.httpClient.get<SolarCustomerModel[]>(`${environment.apiUrl}/solarBilling/getAllActiveSolarCustomers`, { params: params });
  }

  public getAllSolarCustomers(companyId: number,): Observable<SolarCustomerModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarCustomerModel[]>(`${environment.apiUrl}/solarBilling/getAllSolarCustomers`, { params: params });
  }

  getSolarCustomer(id: number): Observable<SolarCustomerModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<SolarCustomerModel>(`${environment.apiUrl}/solarBilling/getSolarCustomer`, { params: params });
  }

  deleteSolarCustomer(id: string): Observable<SolarCustomerModel> {
    return this.httpClient.delete<SolarCustomerModel>(`${environment.apiUrl}/solarBilling/deleteSolarCustomer/${id}`);
  }

  completeSolarCustomer(id: number): Observable<SolarCustomerModel> {
      let params = new HttpParams().append('id', id.toString());
      return this.httpClient.get<SolarCustomerModel>(`${environment.apiUrl}/solarBilling/completeSolarCustomer`, { params: params });
    }

  addNewBilling(billing: SolarBillingModel): Observable<SolarBillingModel> {
    return this.httpClient.post<SolarBillingModel>(`${environment.apiUrl}/solarBilling/create`, billing);
  }

  public getAllBillings(companyId: number, sessionYear: number): Observable<SolarBillingModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('sessionYear', sessionYear.toString());

    return this.httpClient.get<SolarBillingModel[]>(`${environment.apiUrl}/solarBilling/getAllBillings`, { params: params });
  }

  public getAllBillingsByCustomerId(companyId: number, customerId: number): Observable<SolarBillingModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('customerId', customerId.toString());
    return this.httpClient.get<SolarBillingModel[]>(`${environment.apiUrl}/solarBilling/getAllBillingsByCustomerId`, { params: params });
  }

  deleteBilling(id: string): Observable<SolarBillingModel> {
    return this.httpClient.delete<SolarBillingModel>(`${environment.apiUrl}/solarBilling/deleteBilling/${id}`);
  }

  approveBilling(id: number): Observable<SolarBillingModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<SolarBillingModel>(`${environment.apiUrl}/solarBilling/approveBilling`, { params: params });
  }

  addNewSolarInventory(billing: SolarProductInventoryModel[]): Observable<SolarProductInventoryModel[]> {
    return this.httpClient.post<SolarProductInventoryModel[]>(`${environment.apiUrl}/solarInventory/create`, billing);
  }

  public getAllProductQuantity(companyId: number,): Observable<number[][]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<number[][]>(`${environment.apiUrl}/solarInventory/getAllProductQuantity`, { params: params });
  }

  addNewSolarminimumItems(billing: SolarProductMinimumModel[]): Observable<SolarProductMinimumModel[]> {
    return this.httpClient.post<SolarProductMinimumModel[]>(`${environment.apiUrl}/solarInventory/createMinimumItems`, billing);
  }

  public getAllMinimumItems(capacity: number,): Observable<SolarProductMinimumModel[]> {
    let params = new HttpParams().append('capacity', capacity.toString());
    return this.httpClient.get<SolarProductMinimumModel[]>(`${environment.apiUrl}/solarInventory/getAllMinimumItems`, { params: params });
  }
}
