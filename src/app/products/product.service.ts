import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryModel, ProductModel } from './product.model';
import { environment } from '@environments/environment';
import { UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClient: HttpClient) {
  }

  addNewProduct(productModel: ProductModel): Observable<ProductModel> {
    return this.httpClient.post<ProductModel>(`${environment.apiUrl}/product/create`, productModel);
  }

  public getAllProducts(): Observable<ProductModel[]> {
    return this.httpClient.get<ProductModel[]>(`${environment.apiUrl}/product/getAllProducts`);
  }

  public getAllProductsByProductType(productType: number): Observable<ProductModel[]> {
    let params = new HttpParams().append('productType', productType.toString());
    return this.httpClient.get<ProductModel[]>(`${environment.apiUrl}/product/getAllProductsByProductType`, { params: params });
  }

  uploadProductsImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/product/uploadFile`, uploadImageData);
  }

  addNewInventory(productModel: InventoryModel): Observable<InventoryModel> {
    return this.httpClient.post<InventoryModel>(`${environment.apiUrl}/inventory/create`, productModel);
  }

  public getAllInventory(): Observable<InventoryModel[]> {
    return this.httpClient.get<InventoryModel[]>(`${environment.apiUrl}/inventory/getAllInventory`);
  }

  public getAllProductQuantity(): Observable<number[][]> {
    return this.httpClient.get<number[][]>(`${environment.apiUrl}/inventory/getAllProductQuantity`);
  }

  uploadInventoryImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/inventory/uploadFile`, uploadImageData);
  }

}
