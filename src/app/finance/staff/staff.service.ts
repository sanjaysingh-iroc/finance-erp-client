import { Injectable } from '@angular/core';
import { ChangePasswordDto, StaffAttendanceApprovalModel, StaffAttendanceDateModel, StaffDocumentModel, StaffLoanModel, StaffModel } from './staff.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AttendanceDataModel, AttendanceDtoModel, CountModel, UploadFileModel } from '../../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private httpClient: HttpClient) {
  }

  public getAllActiveUsers(companyId: number, userType: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    if (userType != undefined) {
      params = params.append('userType', userType.toString());
    }
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsers`, { params: params });
  }

  public getAllActiveUsersBySession(companyId: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsersBySession`, { params: params });
  }

  getUsersByName(companyId: number, name: string): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('name', name);
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsersByName`, { params: params });
  }

  public getAllUsers(companyId: number,): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllUsers`, { params: params });
  }

  addNewStaff(staff: StaffModel): Observable<StaffModel> {
    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/create`, staff);
  }

  uploadStaffsImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/user/uploadFile`, uploadImageData);
  }

  deleteStaff(id: string, exitDate: string): Observable<StaffModel> {
    return this.httpClient.delete<StaffModel>(`${environment.apiUrl}/user/deleteUser/${id}/${exitDate}`);
  }

  getStaff(id: string): Observable<StaffModel> {
    let params = new HttpParams().append('id', id);
    return this.httpClient.get<StaffModel>(`${environment.apiUrl}/user/getUser`, { params: params });
  }

  getAllExStaff(companyId: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllExStaff`, { params: params });
  }

  getBirthdayStaff(companyId: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getBirthdayStaff`, { params: params });
  }

  addStaffAttendances(staffAttendanceModel: AttendanceDtoModel) {

    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/addStaffAttendances`, staffAttendanceModel);
  }

  getAllStaffAttendance(companyId: number, startDate: string, endDate: string): Observable<AttendanceDtoModel> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('startDate', startDate).append('endDate', endDate);
    return this.httpClient.get<AttendanceDtoModel>(`${environment.apiUrl}/user/getAllStaffAttendances`, { params: params });
  }

  getAllStaffAttendanceByMonthAndYear(companyId: number, month: number, year: number): Observable<StaffAttendanceDateModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString()).append('month', month.toString()).append('year', year.toString());
    return this.httpClient.get<StaffAttendanceDateModel[]>(`${environment.apiUrl}/user/getStaffAttendancesByMonthAndYear`, { params: params });
  }

  getApproveStaffAttendances(companyId: number, startDate: string, endDate: string) {
    let params = new HttpParams().append('companyId', companyId.toString()).append('startDate', startDate).append('endDate', endDate);
    return this.httpClient.get<StaffAttendanceApprovalModel[]>(`${environment.apiUrl}/user/getApproveStaffAttendances`, { params: params });
  }

  approveStaffAttendances(staffAttendanceApprovalModelList: StaffAttendanceApprovalModel[]) {
    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/approveStaffAttendances`, staffAttendanceApprovalModelList);
  }

  addStaffsDocuments(staffDocument: StaffDocumentModel): Observable<StaffDocumentModel> {
    return this.httpClient.post<StaffDocumentModel>(`${environment.apiUrl}/user/addDocument`, staffDocument);
  }
  getStaffsDocuments(staffId: number): Observable<StaffDocumentModel[]> {
    let params = new HttpParams().append('staffId', staffId + '');
    return this.httpClient.get<StaffDocumentModel[]>(`${environment.apiUrl}/user/getStaffDocuments`, { params: params });
  }

  deleteStaffsDocuments(documentId: number) {
    return this.httpClient.delete<StaffDocumentModel[]>(`${environment.apiUrl}/user/deleteStaffDocument/${documentId}`);
  }


  getStaffApprovedAttendances(staffId: number, startDate: string, endDate: string): Observable<StaffAttendanceDateModel[]> {
    let params = new HttpParams().append('staffId', staffId.toString()).append('startDate', startDate).append('endDate', endDate);
    return this.httpClient.get<StaffAttendanceDateModel[]>(`${environment.apiUrl}/user/getStaffApprovedAttendances`, { params: params });
  }

  changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/changePassword/${userId}`, changePasswordDto);
  }

  addNewStaffLoan(expensesModel: StaffLoanModel): Observable<StaffLoanModel> {
    return this.httpClient.post<StaffLoanModel>(`${environment.apiUrl}/user/createLoan`, expensesModel);
  }

  public getAllUnApproveLoans(companyId: number,): Observable<StaffLoanModel[]> {
    let params = new HttpParams().append('companyId', companyId.toString());

    return this.httpClient.get<StaffLoanModel[]>(`${environment.apiUrl}/user/getAllUnApproveLoans`, { params: params });
  }

  deleteStaffLoans(id: string): Observable<StaffLoanModel> {
    return this.httpClient.delete<StaffLoanModel>(`${environment.apiUrl}/user/deleteLoan/${id}`);
  }
}
