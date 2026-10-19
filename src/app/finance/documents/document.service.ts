import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CashReceiptModel, SolarAgreementModel, SolarEstimateModel, SolarProposalModel } from './document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private httpClient: HttpClient) {
  }

  addNewCashReceipt(billing: CashReceiptModel): Observable<CashReceiptModel> {
    return this.httpClient.post<CashReceiptModel>(`${environment.apiUrl}/documents/createCashReceipt`, billing);
  }

  public getAllCashReceipts(companyId: number,): Observable<CashReceiptModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CashReceiptModel[]>(`${environment.apiUrl}/documents/getAllCashReceipts`, { params: params });
  }

  public getLatestCashReceipt(companyId: number,): Observable<CashReceiptModel> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<CashReceiptModel>(`${environment.apiUrl}/documents/getLatestCashReceipt`, { params: params });
  }

  deleteCashReceipt(id: string): Observable<CashReceiptModel> {
    return this.httpClient.delete<CashReceiptModel>(`${environment.apiUrl}/documents/deleteCashReceipt/${id}`);
  }

  approveCashReceipt(companyId: number, id: number, staffId: number): Observable<CashReceiptModel> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('id', id.toString()).append('staffId', staffId.toString());
    return this.httpClient.get<CashReceiptModel>(`${environment.apiUrl}/documents/approveCashReceipt`, { params: params });
  }

  addNewSolarEstimate(billing: SolarEstimateModel): Observable<SolarEstimateModel> {
    return this.httpClient.post<SolarEstimateModel>(`${environment.apiUrl}/documents/createSolarEstimate`, billing);
  }

  public getAllSolarEstimates(companyId: number,): Observable<SolarEstimateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarEstimateModel[]>(`${environment.apiUrl}/documents/getAllSolarEstimates`, { params: params });
  }

  public getLatestSolarEstimate(companyId: number,): Observable<SolarEstimateModel> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarEstimateModel>(`${environment.apiUrl}/documents/getLatestSolarEstimate`, { params: params });
  }

  deleteSolarEstimate(id: string): Observable<SolarEstimateModel> {
    return this.httpClient.delete<SolarEstimateModel>(`${environment.apiUrl}/documents/deleteSolarEstimate/${id}`);
  }

   addNewSolarAgreement(billing: SolarAgreementModel): Observable<SolarAgreementModel> {
    return this.httpClient.post<SolarAgreementModel>(`${environment.apiUrl}/documents/createSolarAgreement`, billing);
  }

  public getAllSolarAgreements(companyId: number,): Observable<SolarAgreementModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarAgreementModel[]>(`${environment.apiUrl}/documents/getAllSolarAgreements`, { params: params });
  }

  public getLatestSolarAgreement(companyId: number,): Observable<SolarAgreementModel> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarAgreementModel>(`${environment.apiUrl}/documents/getLatestSolarAgreement`, { params: params });
  }

  deleteSolarAgreement(id: string): Observable<SolarAgreementModel> {
    return this.httpClient.delete<SolarAgreementModel>(`${environment.apiUrl}/documents/deleteSolarAgreement/${id}`);
  }

 addNewSolarProposal(billing: SolarProposalModel): Observable<SolarProposalModel> {
    return this.httpClient.post<SolarProposalModel>(`${environment.apiUrl}/documents/createSolarProposal`, billing);
  }

  public getAllSolarProposals(companyId: number,): Observable<SolarProposalModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarProposalModel[]>(`${environment.apiUrl}/documents/getAllSolarProposals`, { params: params });
  }

  public getLatestSolarProposal(companyId: number,): Observable<SolarProposalModel> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<SolarProposalModel>(`${environment.apiUrl}/documents/getLatestSolarProposal`, { params: params });
  }

  deleteSolarProposal(id: string): Observable<SolarProposalModel> {
    return this.httpClient.delete<SolarProposalModel>(`${environment.apiUrl}/documents/deleteSolarProposal/${id}`);
  }


}
