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

  public getAllCustomers(companyId: number,): Observable<CustomerModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CustomerModel[]>(`${environment.apiUrl}/customer/getAllCustomers`, { params: params });
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

  public getAllCustomerLoans(companyId: number,): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getAllCustomerLoans`, { params: params });
  }

  public getAllCompleteCustomerLoans(companyId: number, complete: boolean): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('complete', complete.toString());
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getAllCompleteCustomerLoans`, { params: params });
  }

  deleteCustomerLoan(id: string): Observable<CustomerLoanModel> {
    return this.httpClient.delete<CustomerLoanModel>(`${environment.apiUrl}/customer/deleteCustomerLoan/${id}`);
  }

  public getCustomerLoans(customerId: number): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('customerId', customerId.toString());
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getCustomerLoans`, { params: params });
  }

  public getCustomerCompleteLoans(customerId: number, complete: boolean): Observable<CustomerLoanModel[]> {
    let params = new HttpParams().append('customerId', customerId.toString()).append('complete', complete.toString());
    return this.httpClient.get<CustomerLoanModel[]>(`${environment.apiUrl}/customer/getCustomerCompleteLoans`, { params: params });
  }

  public getCustomerLoansByInvoice(invoiceId: number): Observable<CustomerLoanModel> {
    let params = new HttpParams().append('invoiceId', invoiceId.toString());
    return this.httpClient.get<CustomerLoanModel>(`${environment.apiUrl}/customer/getCustomerLoansByInvoice`, { params: params });
  }


  public getMaxCustomerLoanId(companyId: number,): Observable<number> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<number>(`${environment.apiUrl}/customer/getMaxCustomerLoanId`, { params: params });
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

  addAllNewCustomerLoanAmount(customerLoanAmountModel: CustomerLoanAmountModel[], depositDate: string, groupId: number): Observable<CustomerLoanAmountModel[]> {
    let params = new HttpParams().append('depositDate', depositDate).append('groupId', groupId.toString());

    return this.httpClient.post<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/createAllCustomerLoanAmount`, customerLoanAmountModel, { params: params });
  }

  public getAllCustomerLoanAmountDetails(companyId: number,): Observable<CustomerLoanAmountModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getAllCustomerLoanAmountDetails`, { params: params });
  }

   public getAllNonApproveCustomerLoanAmountDetails(companyId: number,): Observable<CustomerLoanAmountModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getAllNonApproveCustomerLoanAmountDetails`, { params: params });
  }


  public calculateAmountByLoanId(companyId: number,): Observable<number[][]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<number[][]>(`${environment.apiUrl}/customer/calculateAmountByLoanId`, { params: params });
  }

  approveCustomerLoanAmount(id: number, staffId: number): Observable<CustomerLoanAmountModel> {
    let params = new HttpParams().append('id', id.toString()).append('staffId', staffId.toString());;
    return this.httpClient.get<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/approveCustomerLoanAmount`, { params: params });
  }

  approveAllCustomerLoanAmount(id: string, staffId: number): Observable<CustomerLoanAmountModel> {
    let params = new HttpParams().append('ids', id).append('staffId', staffId.toString());;
    return this.httpClient.get<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/approveAllLoanAmount`, { params: params });
  }

  deleteCustomerLoanAmount(id: string): Observable<CustomerLoanAmountModel> {
    return this.httpClient.delete<CustomerLoanAmountModel>(`${environment.apiUrl}/customer/deleteCustomerLoanAmount/${id}`);
  }

  public getCustomerLoanByLastDeposit(companyId: number,): Observable<CustomerLoanAmountModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getCustomerLoanByLastDeposit`, { params: params });
  }

  public getCustomerLoansByDate(companyId: number, depositDate: string): Observable<any[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('depositDate', depositDate);
    return this.httpClient.get<any[]>(`${environment.apiUrl}/customer/getCustomerLoansByDate`, { params: params });
  }

  public getCustomerLoansByGroupAndDate(companyId: number, depositDate: string, groupId: number): Observable<any[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('depositDate', depositDate).append('groupId', groupId.toString());
    return this.httpClient.get<any[]>(`${environment.apiUrl}/customer/getCustomerLoansByGroupAndDate`, { params: params });
  }

  public getAllLoanAmountByDepositDate(companyId: number, depositDate: string, groupId: number): Observable<CustomerLoanAmountModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('depositDate', depositDate.toString()).append('groupId', groupId.toString());
    return this.httpClient.get<CustomerLoanAmountModel[]>(`${environment.apiUrl}/customer/getAllLoanAmountByDepositDate`, { params: params });
  }

}
