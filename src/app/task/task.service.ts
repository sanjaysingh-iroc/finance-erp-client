import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { TaskModel } from './task.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private httpClient: HttpClient) {
  }


  addNewTask(taskModel: TaskModel): Observable<TaskModel> {
    return this.httpClient.post<TaskModel>(`${environment.apiUrl}/task/create`, taskModel);
  }

  deleteTask(id: string): Observable<TaskModel> {
    return this.httpClient.delete<TaskModel>(`${environment.apiUrl}/task/deleteTask/${id}`);
  }

  public getAllActiveTasks(companyId: number): Observable<TaskModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<TaskModel[]>(`${environment.apiUrl}/task/getAllTask`, { params: params });
  }
}
