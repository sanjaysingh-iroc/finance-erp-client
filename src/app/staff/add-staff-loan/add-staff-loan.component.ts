import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { StaffService } from '../staff.service';
import { StaffLoanModel, StaffModel } from '../staff.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../session/session.model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';
import { LoginModel } from '../../auth/login-model';
import { Utils } from '../../shared/util-class';

@Component({
  selector: 'app-add-staff-loan',
  templateUrl: './add-staff-loan.component.html',
  styleUrls: ['./add-staff-loan.component.css']
})
export class AddStaffLoanComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  staffLoansModel: StaffLoanModel;
  staffLoansForm: FormGroup;
  session: SessionModel;
  spinnerButtonOptions: MatProgressButtonOptions;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  minDate: Date;
  maxDate: Date;
  login: LoginModel;
  amountInWords: string;

  constructor(private fb: FormBuilder,
    private staffService: StaffService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    public utils: Utils,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;

    this.maxDate = new Date();
    this.minDate = new Date(this.session.fromDate);

    this.action = history.state.action;

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });
    if (this.action == 'edit') {
      this.staffLoansModel = history.state.staffLoansModel;
      this.dialogTitle = 'Edit';

    } else {
      this.staffLoansModel = new StaffLoanModel({});
      this.staffLoansModel.staffLoanDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en')
    }


    this.staffLoansForm = this.fb.group({
      staffId: [this.staffLoansModel.staffId, [Validators.required]],
      staffLoanDate: [this.staffLoansModel.staffLoanDate, [Validators.required]],
      amount: [this.staffLoansModel.amount, [Validators.required, Validators.min(0)]],
      comment: [this.staffLoansModel.comment]
    });
  }

  convertAmtInWords(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords = this.utils.convertToWords(amount);
  }


  onSubmit() {
    const staffLoansModel: StaffLoanModel = new StaffLoanModel(this.staffLoansForm.value);
    staffLoansModel.staffLoanDate = formatDate(this.staffLoansForm.get("staffLoanDate").value, settings.SAVE_DATE_FORMAT, 'en');
    if (this.action == 'edit') {
      staffLoansModel.id = this.staffLoansModel.id;
    }
    staffLoansModel.companyId = this.login.companyId;

    this.spinnerButtonOptions.active = true;
    this.staffService.addNewStaffLoan(staffLoansModel).pipe(first()).subscribe(data => {
      this.router.navigate(['finance/finance/staff/all-staff-loans']);
    });
  }
}
