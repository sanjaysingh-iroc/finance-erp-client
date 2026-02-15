import { Injectable } from '@angular/core';
import { VendorModel } from './vendor.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private httpClient: HttpClient) {
  }

  addNewVendor(vendor: VendorModel): Observable<VendorModel> {
    return this.httpClient.post<VendorModel>(`${environment.apiUrl}/vendor/create`, vendor);
  }

  public getAllVendors(): Observable<VendorModel[]> {
    return this.httpClient.get<VendorModel[]>(`${environment.apiUrl}/vendor/getAllVendors`);
  }


  uploadVendorsImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/vendor/uploadFile`, uploadImageData);
  }


}
