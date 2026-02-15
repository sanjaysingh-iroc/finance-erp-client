import { Component, OnInit } from '@angular/core';
import { StaffDocumentModel, StaffModel } from '../staff.model';
import { UtilsService } from '../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from './dialog-delete-document/dialog-delete.component';
import { DialogViewAttendanceComponent } from './view-dialog-staff-attendance/view-attendance.component';
import { SessionModel } from '../../session/session.model';
import { StaffService } from '../staff.service';
import { AttendanceDataModel, FullName } from '../../shared/common.models';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { HolidayService } from '../../holidays/holiday.service';
import { HolidayModel } from '../../holidays/holiday.model';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { CommonServices } from '../../shared/services/common-services';
import { SessionService } from '../../session/session.service';

@Component({
  selector: 'app-about-staff',
  templateUrl: './about-staff.component.html',
  styleUrls: ['./about-staff.component.sass']
})
export class AboutStaffComponent implements OnInit {

  documentForm: FormGroup;

  staff: StaffModel;
  staffDocuments: StaffDocumentModel[] = [];
  genderMap: Map<number, string> = new Map<number, string>();
  userTypeMap: Map<number, string> = new Map<number, string>();

  showDateFormat: string;

  sessionYearMap: Map<number, string> = new Map<number, string>();
  monthMap = monthMap;
  weekMap: Map<number, FullName> = weekMap;

  monthList: string[] = [];
  attendanceMap: Map<string, AttendanceDataModel> = new Map<string, AttendanceDataModel>();
  activitiesMap: Map<number, number> = new Map<number, number>();
  session: SessionModel = undefined;
  apiURL: string = environment.apiUrl;
  spinnerButtonOptions: MatProgressButtonOptions;
  holidayList: HolidayModel[] = []

  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  sectionMap: Map<number, string> = new Map<number, string>();
  subjectsMap: Map<number, string> = new Map<number, string>();
  constructor(
    private staffService: StaffService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private holidayService: HolidayService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['pages/staff/all-staff']);
    }
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.session = this.localStorageData.sessionValue;

    this.documentForm = this.fb.group({
      name: ['', [Validators.required]],
      uploadDoc: [undefined, [Validators.required, this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });
    this.staff = history.state.staff;

    this.holidayService.getAllHolidays(this.session.id).subscribe(
      data => {
        this.holidayList = data;
      }
    );
    this.utilsService.getWeeklyOff()
      .subscribe(data => data.forEach(element => {
        this.weeklyOffMap.set(element.weekDaysNumber, element.active);
        if (element.active) {
          this.weekMap.delete(element.weekDaysNumber);
        }
      }));

    this.getDocument();
    this.getAttendance();

    this.sessionService.getAllSessionYears().subscribe(data => data.forEach(element => this.sessionYearMap.set(element.id, element.name)));

    this.utilsService.getAllGender()
      .subscribe(data => data.forEach(element => this.genderMap.set(element.id, element.name)));

    this.utilsService.getAllUserType()
      .subscribe(data => data.forEach(element => this.userTypeMap.set(element.id, element.name)));

  }

  updateStaffUrl(event, row) {
    event.target.src = row.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }

  getDocument() {
    this.staffService.getStaffsDocuments(this.staff.id).subscribe(data => this.staffDocuments = data);
  }

  getAttendance() {
    for (const entry of this.monthMap.entries()) {
      this.monthList.push(entry[1].full);
    }

    this.staffService.getStaffAttendancesByStaffAndSession(this.staff.id, this.session.fromDate, this.session.toDate, this.session.id).subscribe(
      data => {
        data.forEach(attendance => {
          this.attendanceMap.set(monthMap.get(attendance.month).full, attendance);
        });
      });
  }


  viewStaffAttendance(title: string, month: number, year: number, staffId: number) {
    const dialogRef = this.dialog.open(DialogViewAttendanceComponent, {
      data: { title: title, month: month, year: year, staffId: staffId }
    });

    dialogRef.afterClosed().subscribe((result) => {

    });
  }

  deleteDocument(row) {
    const id = row.id;

    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.staffService.deleteStaffsDocuments(id).subscribe(() => {
          const foundIndex = this.staffDocuments.findIndex(
            (x) => x.id == id
          );
          this.staffDocuments.splice(foundIndex, 1);
        });
      }
    });
  }

  onDocumentSubmit() {
    this.spinnerButtonOptions.active = true;

    let uploadImageData = new FormData();
    const file = this.documentForm.getRawValue().uploadDoc.files[0];

    uploadImageData.append("file", file);
    uploadImageData.append("staffId", this.staff.id + "");
    this.staffService.uploadStaffsImage(uploadImageData).subscribe(
      (response) => {
        const staffDocument = new StaffDocumentModel();
        staffDocument.staffId = this.staff.id;
        staffDocument.documentName = this.documentForm.getRawValue().name;
        staffDocument.uploadDocument = response.fileDownloadUri;
        staffDocument.active = true;

        this.staffService.addStaffsDocuments(staffDocument).subscribe(
          (data) => {
            this.spinnerButtonOptions.active = false;
            this.staffDocuments.push(data);
            this.documentForm.reset();
          }
        );
      }
    );
  }


}
