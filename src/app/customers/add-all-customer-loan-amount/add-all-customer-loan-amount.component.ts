import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { first, map, startWith } from 'rxjs/operators';
import { CustomerService } from '../customer.service';
import { CustomerLoanAmountModel, CustomerLoanModel, CustomerModel } from '../customer.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';
import { Observable } from 'rxjs';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { LoginModel } from '../../auth/login-model';
import { Utils } from '../../shared/util-class';
import { GroupModel, PaymentTypeModel } from '../../shared/common.models';
import { UtilsService } from '../../shared/services/utils.service';
import { SessionModel } from '../../session/session.model';
import { NotificationsService } from '../../shared/notifications-service';


@Component({
  selector: 'app-add-all-customer-loan-amount',
  templateUrl: './add-all-customer-loan-amount.component.html',
  styleUrls: ['./add-all-customer-loan-amount.component.css']
})
export class AddAllCustomerLoanAmountComponent implements OnInit {

  session: SessionModel;

  studentFormArray = new FormArray([]);
  classForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  login: LoginModel;
  groupModels: GroupModel[] = [];
  allCustomerLoanAmountMap: Map<number, CustomerLoanAmountModel> = new Map<number, CustomerLoanAmountModel>();
  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();

  constructor(
    private customerService: CustomerService,
    private localStorageData: LocalStorageData,
    private commonLayout: CommonLayout,
    private fb: FormBuilder,
    private notification: NotificationsService,
    private utilsService: UtilsService,

  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.login = this.localStorageData.userValue;

    this.utilsService.getAllGroupDetails().subscribe(data => {
      this.groupModels = data;

    });

    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));
    });
    this.classForm = this.fb.group({
      depositDate: [new Date],
      groupId: [0],
      students: this.studentFormArray,
    });

    this.onDateChange();
  }

  onDateChange() {
    let depositDate = this.classForm.get('depositDate').value;
    let groupId = this.classForm.get('groupId').value;

    this.allCustomerLoanAmountMap.clear();
    this.customerService.getAllLoanAmountByDepositDate(this.login.companyId, formatDate(depositDate, settings.SAVE_DATE_FORMAT, 'en'), groupId).subscribe(data => {
      data.forEach(student => {
        this.allCustomerLoanAmountMap.set(student.customerId, student);
      });
      this.fetchCustomerLoanData(depositDate, groupId);
    });
  }

  fetchCustomerLoanData(depositDate: Date, groupId: number) {
    if (groupId != 0) {
      this.studentFormArray.clear();
      this.customerService.getCustomerLoansByGroupAndDate(this.login.companyId, formatDate(depositDate, settings.SAVE_DATE_FORMAT, 'en'), groupId).subscribe(data => {
        data.forEach(student => {
          let customerLoanAmountModel: CustomerLoanAmountModel = this.allCustomerLoanAmountMap.get(student[1]) ? this.allCustomerLoanAmountMap.get(student[1]) : new CustomerLoanAmountModel({ amount: 0, paymentMode: 1, approved: 0 });

          this.studentFormArray.push(this.initSectionRow(student[0], student[1], student[2] + " S/O " + student[3], customerLoanAmountModel.amount, customerLoanAmountModel.paymentMode, customerLoanAmountModel.approved));
        });
      });
    }
  }

  initSectionRow(loanId, id, name, amount, paymentMode, approved) {
    return this.fb.group({
      loanId: [loanId],
      customerId: new FormControl(id),
      name: [name],
      amount: [amount],
      paymentMode: [paymentMode],
      approved: approved
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;

    const studentRolls: CustomerLoanAmountModel[] = [];
    for (const student of this.classForm.value.students) {
      if (student.amount && student.amount > 0) {
        let customerLoanAmountModel: CustomerLoanAmountModel = new CustomerLoanAmountModel({
          customerId: student.customerId,
          loanId: student.loanId,
          depositDate: formatDate(this.classForm.get("depositDate").value, settings.SAVE_DATE_FORMAT, 'en'),
          paymentMode: student.paymentMode,
          amount: student.amount,
        });
        customerLoanAmountModel.createdBy = this.login.id;
        customerLoanAmountModel.companyId = this.login.companyId;


        studentRolls.push(customerLoanAmountModel);
      }

    }

    let depositDate = this.classForm.get('depositDate').value;
    let groupId = this.classForm.get('groupId').value;

    if (studentRolls.length > 0) {
      this.customerService.addAllNewCustomerLoanAmount(studentRolls, formatDate(depositDate, settings.SAVE_DATE_FORMAT, 'en'), groupId).subscribe((data) => {
        this.spinnerButtonOptions.active = false;
        this.notification.showSuccessNotification(
          'Add Record Successfully...!!!',
          'bottom'
        );
      });
    } else {
      this.spinnerButtonOptions.active = false;
      this.notification.showDangerNotification(
        'No Record Updated...!!!',
        'bottom'
      );
    }


  }

}
