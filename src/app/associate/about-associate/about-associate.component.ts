import { Component, OnInit } from '@angular/core';
import { AssociateDocumentModel, AssociateModel } from '../associate.model';
import { UtilsService } from '../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from './dialog-delete-document/dialog-delete.component';
import { SessionModel } from '../../session/session.model';
import { AssociateService } from '../associate.service';
import { AttendanceDataModel, FullName } from '../../shared/common.models';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { SessionService } from '../../session/session.service';

@Component({
  selector: 'app-about-associate',
  templateUrl: './about-associate.component.html',
  styleUrls: ['./about-associate.component.sass']
})
export class AboutAssociateComponent implements OnInit {

  documentForm: FormGroup;

  associate: AssociateModel;
  associateDocuments: AssociateDocumentModel[] = [];
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

  weeklyOffMap: Map<number, boolean> = new Map<number, boolean>();
  sectionMap: Map<number, string> = new Map<number, string>();
  subjectsMap: Map<number, string> = new Map<number, string>();
  constructor(
    private associateService: AssociateService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['finance/finance/associate/all-associate']);
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
    this.associate = history.state.associate;


    this.utilsService.getWeeklyOff()
      .subscribe(data => data.forEach(element => {
        this.weeklyOffMap.set(element.weekDaysNumber, element.active);
        if (element.active) {
          this.weekMap.delete(element.weekDaysNumber);
        }
      }));

    this.getDocument();

    this.sessionService.getAllSessionYears().subscribe(data => data.forEach(element => this.sessionYearMap.set(element.id, element.name)));

    this.utilsService.getAllUserType()
      .subscribe(data => data.forEach(element => this.userTypeMap.set(element.id, element.name)));

  }

  updateAssociateUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }

  getDocument() {
    this.associateService.getAssociatesDocuments(this.associate.id).subscribe(data => this.associateDocuments = data);
  }


  deleteDocument(row) {
    const id = row.id;

    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.associateService.deleteAssociatesDocuments(id).subscribe(() => {
          const foundIndex = this.associateDocuments.findIndex(
            (x) => x.id == id
          );
          this.associateDocuments.splice(foundIndex, 1);
        });
      }
    });
  }

}
