import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { SessionModel } from '../../session/session.model';
import { settings } from '../../demo/data';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { LocalStorageData } from '../../shared/local-storage-data';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { SessionService } from '../../session/session.service';
import { StaffModel } from '../../staff/staff.model';
import { StaffService } from '../../staff/staff.service';
import { UtilsService } from '../../shared/services/utils.service';

@Component({
  selector: 'app-new-staff-report',
  templateUrl: './new-staff-report.component.html',
  styleUrls: ['./new-staff-report.component.sass']
})
export class NewStaffReportComponent implements OnInit {

  showDateFormat: string;

  staffsList: StaffModel[] = [];
  genderMap: Map<number, string> = new Map<number, string>();
  classMap: Map<number, string> = new Map<number, string>();
  sectionMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  session: SessionModel;
  constructor(
    private staffsService: StaffService,
    private utilsService: UtilsService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private localStorageData: LocalStorageData,

  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.utilsService.getAllGender()
      .subscribe(data => data.forEach(element => this.genderMap.set(element.id, element.name)));
    this.getStaffData();
  }

  updateStaffUrl(event, row) {
    event.target.src = row.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }
  generatePDF(action = 'open') {
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('New Staff Report', [], data, { alignment: 'center', margin: [0, 5, 0, 15] }, 'portrait', action, 1);
  }
  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Staff Name', style: 'tableHeader' },
      { text: 'DOB', style: 'tableHeader' },
      { text: 'Gender', style: 'tableHeader' },
      { text: 'Mobile No.', style: 'tableHeader' },
      { text: 'Email', style: 'tableHeader' },
      { text: 'Date of Joining', style: 'tableHeader' }

    ];
  }
  exportExcel() {
    let columns = [
      { header: 'Sr. No.', key: 'sr', width: 10 },

      { header: 'Staff Name', key: 'name', width: 20 },
      { header: 'DOB', key: 'dob', width: 20 },
      { header: 'Gender', key: 'gender', width: 20 },
      { header: 'Mobile', key: 'mobile', width: 20 },
      { header: 'Email', key: 'Email', width: 20 },
      { header: 'Date of Joining', key: 'Date of Joining', width: 20 },
    ];

    let data = [];
    let index = 0;
    this.staffsList.map(staff => {
      let row = [];
      row.push((++index).toString());
      row.push(staff.name);
      row.push(formatDate(staff.dob, settings.SHOW_DATE_FORMAT, 'en'));
      row.push(this.genderMap.get(staff.gender));
      row.push(staff.mobile);
      row.push(staff.email);
      row.push(formatDate(staff.dateOfJoining, settings.SHOW_DATE_FORMAT, 'en'));
      data.push(row);
    });

    this.excelExportService.exportExcel(columns, data, "New Staff Details", "NewStaff");
  }


  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());
    this.staffsList.map(staff => {
      let row = [];
      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: staff.name, style: 'subheader' });
      row.push({ text: formatDate(staff.dob, settings.SHOW_DATE_FORMAT, 'en'), style: 'subheader' });
      row.push({ text: this.genderMap.get(staff.gender), style: 'subheader' });
      row.push({ text: staff.mobile, style: 'subheader' });
      row.push({ text: staff.email, style: 'subheader' });
      row.push({ text: formatDate(staff.dateOfJoining, settings.SHOW_DATE_FORMAT, 'en'), style: 'subheader' });
      data.push(row);
    });

    return data;
  }

  private getStaffData() {
    this.staffsList = [];
    this.staffsService.getAllActiveUsersBySession(this.session.id)
      .subscribe(staffs => {
        this.staffsList = staffs;
        this.staffsList.sort((a, b) => a.name.localeCompare(b.name));
      });
  }
}
