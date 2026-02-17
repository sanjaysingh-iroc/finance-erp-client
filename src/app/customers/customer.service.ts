import { Injectable } from '@angular/core';
import { CustomerLoanAmountModel, CustomerLoanModel, CustomerModel } from './customer.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private httpClient: HttpClient) {
  }

  addNewCustomer(customer: CustomerModel): Observable<CustomerModel> {
    return this.httpClient.post<CustomerModel>(`${environment.apiUrl}/customer/create`, customer);
  }

  public getAllCustomers(): Observable<CustomerModel[]> {
    return this.httpClient.get<CustomerModel[]>(`${environment.apiUrl}/customer/getAllCustomers`);
  }

  public getAllCustomersByIds(ids: number[]): Observable<CustomerModel[]> {
    let params = new HttpParams().append('customerIds', ids.toString());
    return this.httpClient.get<CustomerModel[]>(`${environment.apiUrl}/customer/getCustomerByIds`, { params: params });
  }

  deleteCustomer(id: string): Observable<CustomerModel> {
    return this.httpClient.delete<CustomerModel>(`${environment.apiUrl}/customer/deleteCustomer/${id}`);
  }

  uploadCustomersImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/customer/uploadFile`, uploadImageData);
  }

  getCustomer(id: number): Observable<CustomerModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<CustomerModel>(`${environment.apiUrl}/customer/getCustomer`, { params: params });
  }

  addNewCustomerLoan(expensesModel: CustomerLoanModel): Observable<CustomerLoanModel> {
    return this.httpClient.post<CustomerLoanModel>(`${environment.apiUrl}/customer/createCustomerLoan`, expensesModel);
  }

  public getAllCustomerLoans(): Observable<CustomerLoanModel[]> {
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getAllCustomerLoans`);
  }

  public getAllCompleteCustomerLoans(complete: boolean): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('complete', complete.toString());
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getAllCompleteCustomerLoans`, { params: params });
  }

  deleteCustomerLoan(id: string): Observable<CustomerLoanModel> {
    return this.httpClient.delete<CustomerLoanModel>(`${environment.apiUrl}/customer/deleteCustomerLoan/${id}`);
  }

  public getCustomerLoans(customerId: number): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('customerId', customerId.toString());
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getCustomerLoans`, { params: params });
  }

 


  public getMaxCustomerLoanId(): Observable<number> {
    return this.httpClient.get<number>(`${environment.apiUrl}/customer/getMaxCustomerLoanId`);
  }

  approveCustomerLoan(id: number, staffId: number): Observable<CustomerLoanModel> {
    let params = new HttpParams().append('id', id.toString()).append('staffId', staffId.toString());
    return this.httpClient.get<CustomerLoanModel>(`${environment.apiUrl}/customer/approveCustomerLoan`, { params: params });
  }

  completeCustomerLoan(id: number): Observable<CustomerLoanModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<CustomerLoanModel>(`${environment.apiUrl}/customer/completeCustomerLoan`, { params: params });
  }


  addNewCustomerLoanAmount(customerLoanAmountModel: CustomerLoanAmountModel): Observable<CustomerLoanAmountModel> {
    return this.httpClient.post<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/createCustomerLoanAmount`, customerLoanAmountModel);
  }

  public getAllCustomerLoanAmountDetails(): Observable<CustomerLoanAmountModel[]> {
    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getAllCustomerLoanAmountDetails`);
  }


  public calculateAmountByLoanId(): Observable<number[][]> {
    return this.httpClient.get<number[][]>(`${environment.apiUrl}/customer/calculateAmountByLoanId`);
  }

  approveCustomerLoanAmount(id: number, staffId: number): Observable<CustomerLoanAmountModel> {
    let params = new HttpParams().append('id', id.toString()).append('staffId', staffId.toString());;
    return this.httpClient.get<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/approveCustomerLoanAmount`, { params: params });
  }

  deleteCustomerLoanAmount(id: string): Observable<CustomerLoanAmountModel> {
    return this.httpClient.delete<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/deleteCustomerLoanAmount/${id}`);
  }

  public getCustomerLoanByLastDeposit(): Observable<CustomerLoanAmountModel[]> {
    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getCustomerLoanByLastDeposit`);
  }

}
