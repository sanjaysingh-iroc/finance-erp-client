import { Injectable } from '@angular/core';
import { AssociateDocumentModel, AssociateModel } from './associate.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class AssociateService {

  constructor(private httpClient: HttpClient) {
  }

  public getAllActiveUsers(companyId: number, userType: number): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    if (userType != undefined) {
      params = params.append('userType', userType.toString());
    }
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/user/getAllActiveUsers`, { params: params });
  }



  getUsersByName(companyId: number, name: string): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('name', name);
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/user/getAllActiveUsersByName`, { params: params });
  }

  public getAllUsers(companyId: number,): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/user/getAllUsers`, { params: params });
  }

  addNewAssociate(associate: AssociateModel): Observable<AssociateModel> {
    return this.httpClient.post<AssociateModel>(`${environment.apiUrl}/user/create`, associate);
  }

  uploadAssociatesImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/user/uploadFile`, uploadImageData);
  }

  deleteAssociate(id: string, exitDate: string): Observable<AssociateModel> {
    return this.httpClient.delete<AssociateModel>(`${environment.apiUrl}/user/deleteUser/${id}/${exitDate}`);
  }

  getAssociate(id: string): Observable<AssociateModel> {
    let params = new HttpParams().append('id', id);
    return this.httpClient.get<AssociateModel>(`${environment.apiUrl}/user/getUser`, { params: params });
  }

  getAllExAssociate(companyId: number): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/user/getAllExAssociate`, { params: params });
  }


  addAssociatesDocuments(associateDocument: AssociateDocumentModel): Observable<AssociateDocumentModel> {
    return this.httpClient.post<AssociateDocumentModel>(`${environment.apiUrl}/user/addDocument`, associateDocument);
  }
  getAssociatesDocuments(associateId: number): Observable<AssociateDocumentModel[]> {
    let params = new HttpParams().append('associateId', associateId + '');
    return this.httpClient.get<AssociateDocumentModel[]>(`${environment.apiUrl}/user/getAssociateDocuments`, { params: params });
  }

  deleteAssociatesDocuments(documentId: number) {
    return this.httpClient.delete<AssociateDocumentModel[]>(`${environment.apiUrl}/user/deleteAssociateDocument/${documentId}`);
  }

}
