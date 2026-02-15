import { Injectable } from '@angular/core';
import { ChangePasswordDto, StaffAttendanceApprovalModel, StaffAttendanceDateModel, StaffDocumentModel, StaffLoanModel, StaffModel } from './staff.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AttendanceDataModel, AttendanceDtoModel, CountModel, UploadFileModel } from '../shared/common.models';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private httpClient: HttpClient) {
  }

  public getAllActiveUsers(sessionYear: number, userType: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    if (userType != undefined) {
      params = params.append('userType', userType.toString());
    }
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsers`, { params: params });
  }

  public getAllActiveUsersBySession(sessionYear: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsersBySession`, { params: params });
  }

  getUsersByName(sessionYear: number, name: string): Observable<StaffModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString()).append('name', name);
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllActiveUsersByName`, { params: params });
  }

  public getAllUsers(): Observable<StaffModel[]> {
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllUsers`);
  }

  addNewStaff(staff: StaffModel): Observable<StaffModel> {
    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/create`, staff);
  }

  uploadStaffsImage(uploadImageData: FormData): Observable<UploadFileModel> {
    return this.httpClient.post<UploadFileModel>(`${environment.apiUrl}/user/uploadFile`, uploadImageData);
  }

  deleteStaff(id: string, sessionYear: number, exitDate: string): Observable<StaffModel> {
    return this.httpClient.delete<StaffModel>(`${environment.apiUrl}/user/deleteUser/${id}/${sessionYear}/${exitDate}`);
  }

  getStaff(id: string): Observable<StaffModel> {
    let params = new HttpParams().append('id', id);
    return this.httpClient.get<StaffModel>(`${environment.apiUrl}/user/getUser`, { params: params });
  }

  getAllExStaff(sessionYear: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getAllExStaff`, { params: params });
  }

  getBirthdayStaff(sessionYear: number): Observable<StaffModel[]> {
    let params = new HttpParams().append('sessionYear', sessionYear.toString());
    return this.httpClient.get<StaffModel[]>(`${environment.apiUrl}/user/getBirthdayStaff`, { params: params });
  }

  addStaffAttendances(staffAttendanceModel: AttendanceDtoModel) {
    return this.httpClient.post<StaffModel>(`${environment.apiUrl}/user/addStaffAttendances`, staffAttendanceModel);
  }

  getAllStaffAttendance(startDate: string, endDate: string): Observable<AttendanceDtoModel> {
    let params = new HttpParams().append('startDate', startDate).append('endDate', endDate);
    return this.httpClient.get<AttendanceDtoModel>(`${environment.apiUrl}/user/getAllStaffAttendances`, { params: params });
  }

  getAllStaffAttendanceByMonthAndYear(month: number, year: number): Observable<StaffAttendanceDateModel[]> {
    let params = new HttpParams().append('month', month.toString()).append('year', year.toString());
    return this.httpClient.get<StaffAttendanceDateModel[]>(`${environment.apiUrl}/user/getStaffAttendancesByMonthAndYear`, { params: params });
  }

  getApproveStaffAttendances(startDate: string, endDate: string) {
    let params = new HttpParams().append('startDate', startDate).append('endDate', endDate);
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

  getStaffAttendancesByStaffAndSession(staffId: number, startDate: string, endDate: string, sessionYear: number): Observable<AttendanceDataModel[]> {
    let params = new HttpParams().append('staffId', staffId.toString()).append('startDate', startDate).append('endDate', endDate).append('sessionYear', sessionYear.toString());
    return this.httpClient.get<AttendanceDataModel[]>(`${environment.apiUrl}/user/getStaffAttendancesByStaffAndSession`, { params: params });
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

  public getAllUnApproveLoans(): Observable<StaffLoanModel[]> {
    return this.httpClient.get<StaffLoanModel[]>(`${environment.apiUrl}/user/getAllUnApproveLoans`);
  }

  deleteStaffLoans(id: string): Observable<StaffLoanModel> {
      return this.httpClient.delete<StaffLoanModel>(`${environment.apiUrl}/user/deleteLoan/${id}`);
    }
}
