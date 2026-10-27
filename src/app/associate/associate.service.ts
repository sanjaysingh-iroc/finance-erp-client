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

  public getAllActiveAssociates(companyId: number): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/associate/getAllActiveAssociates`, { params: params });
  }



  getAssociatesByName(companyId: number, name: string): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('name', name);
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/associate/getAllActiveAssociatesByName`, { params: params });
  }

  public getAllAssociates(companyId: number,): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/associate/getAllAssociates`, { params: params });
  }

  addNewAssociate(associate: AssociateModel): Observable<AssociateModel> {
    return this.httpClient.post<AssociateModel>(`${environment.apiUrl}/associate/create`, associate);
  }

  uploadAssociatesImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/associate/uploadFile`, uploadImageData);
  }

  deleteAssociate(id: string, exitDate: string): Observable<AssociateModel> {
    return this.httpClient.delete<AssociateModel>(`${environment.apiUrl}/associate/deleteAssociate/${id}/${exitDate}`);
  }

  getAssociate(id: string): Observable<AssociateModel> {
    let params = new HttpParams().append('id', id);
    return this.httpClient.get<AssociateModel>(`${environment.apiUrl}/associate/getAssociate`, { params: params });
  }

  getAllExAssociate(companyId: number): Observable<AssociateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<AssociateModel[]>(`${environment.apiUrl}/associate/getAllExAssociate`, { params: params });
  }


  addAssociatesDocuments(associateDocument: AssociateDocumentModel): Observable<AssociateDocumentModel> {
    return this.httpClient.post<AssociateDocumentModel>(`${environment.apiUrl}/associate/addDocument`, associateDocument);
  }
  getAssociatesDocuments(associateId: number): Observable<AssociateDocumentModel[]> {
    let params = new HttpParams().append('associateId', associateId + '');
    return this.httpClient.get<AssociateDocumentModel[]>(`${environment.apiUrl}/associate/getAssociateDocuments`, { params: params });
  }

  deleteAssociatesDocuments(documentId: number) {
    return this.httpClient.delete<AssociateDocumentModel[]>(`${environment.apiUrl}/associate/deleteAssociateDocument/${documentId}`);
  }

}
