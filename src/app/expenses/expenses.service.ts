import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ExpensesModel, ExpenseTypeMdel } from './expenses.model';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  constructor(private httpClient: HttpClient) {
  }

  public getAllExpenseTypes(): Observable<ExpenseTypeMdel[]> {
    return this.httpClient.get<ExpenseTypeMdel[]>(`${environment.apiUrl}/expenses/getAllExpenseTypes`);
  }

  public getAllExpenses(sessionYear: number): Observable<ExpensesModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<ExpensesModel[]>(`${environment.apiUrl}/expenses/getAllExpenses`, { params: params });
  }

  public getAllUnApproveExpenses(sessionYear: number): Observable<ExpensesModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<ExpensesModel[]>(`${environment.apiUrl}/expenses/getAllUnApproveExpenses`, { params: params });
  }

  approveExpenses(id: number): Observable<ExpensesModel> {
    let params = new HttpParams().append('id', id.toString());
    return this.httpClient.get<ExpensesModel>(`${environment.apiUrl}/expenses/approveExpense`, { params: params });
  }

  addNewExpenses(expensesModel: ExpensesModel): Observable<ExpensesModel> {
    return this.httpClient.post<ExpensesModel>(`${environment.apiUrl}/expenses/create`, expensesModel);
  }

  deleteExpenses(id: string): Observable<ExpensesModel> {
    return this.httpClient.delete<ExpensesModel>(`${environment.apiUrl}/expenses/deleteExpenses/${id}`);
  }

  uploadCompanyLogo(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/expenses/uploadFile`, uploadImageData);
  }

}
