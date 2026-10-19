import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ExpensesService } from '../../expenses/expenses.service';
import { ExpenseTypeMdel, ExpensesModel } from '../expenses.model';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../../session/session.model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../../demo/data';
import { LoginModel } from '../../../auth/login-model';
import { forkJoin, of } from 'rxjs';
import { UtilsService } from '../../../shared/services/utils.service';
import { environment } from '@environments/environment';
import { Utils } from '../../../shared/util-class';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.css']
})
export class AddExpensesComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  expensesModel: ExpensesModel;
  expensesForm: FormGroup;
  expenseTypeMap: Map<number, ExpenseTypeMdel> = new Map<number, ExpenseTypeMdel>();
  session: SessionModel;
  isOther = false;
  spinnerButtonOptions: MatProgressButtonOptions;

  minDate: Date;
  maxDate: Date;
  login: LoginModel;
  apiURL: string = environment.apiUrl;
  amountInWords: string;

  constructor(private fb: FormBuilder,
    private expensesService: ExpensesService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private utilsService: UtilsService,
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
    if (this.action == 'edit') {
      this.expensesModel = history.state.expensesModel;
      this.dialogTitle = 'Edit';

    } else {
      this.expensesModel = new ExpensesModel({});
      this.expensesModel.expensesDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en')
    }

    this.expensesService.getAllExpenseTypes().subscribe(data => {
      data.forEach(expenseTyp => this.expenseTypeMap.set(expenseTyp.id, expenseTyp));

      if (this.expenseTypeMap.get(this.expensesModel.expenseTypeId)) {
        this.isOther = this.expenseTypeMap.get(this.expensesModel.expenseTypeId).isOther;

      }
    });

    this.expensesForm = this.fb.group({
      expenseTypeId: [this.expensesModel.expenseTypeId, [Validators.required]],
      otherInfo: [this.expensesModel.otherInfo, [Validators.required]],
      expensesDate: [this.expensesModel.expensesDate, [Validators.required]],
      amount: [this.expensesModel.amount, [Validators.required, Validators.min(0)]],
      comment: [this.expensesModel.comment],
      uploadDocument: [''],
    });
    this.checkValidation();
  }

  convertAmtInWords(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords= this.utils.convertToWords(amount);
  }


  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  onSessionYearChange(event) {
    this.isOther = this.expenseTypeMap.get(event.value).isOther;
    this.checkValidation();
  }

  checkValidation() {
    if (this.isOther) {
      this.expensesForm.get('otherInfo').setValidators([Validators.required]);
    } else {
      this.expensesForm.get('otherInfo').clearValidators();
    }
    this.expensesForm.get('otherInfo').updateValueAndValidity();
  }

  onSubmit() {
    const expensesModel: ExpensesModel = new ExpensesModel(this.expensesForm.value);
    expensesModel.companyId = this.login.companyId;
    expensesModel.sessionYear = this.session.id;
    expensesModel.expensesDate = formatDate(this.expensesForm.get("expensesDate").value, settings.SAVE_DATE_FORMAT, 'en');
    if (this.action == 'edit') {
      expensesModel.id = this.expensesModel.id;
    }
    // this.spinnerButtonOptions.active = true;

    this.uploadAllDoc(expensesModel);
  }

  uploadAllDoc(expensesModel: ExpensesModel) {
    const apiCalls = {
      uploadDocument: this.uploadDoc(this.expensesForm.value.uploadDocument),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        expensesModel.uploadDocument = (results as any).uploadDocument.fileDownloadUri ? (results as any).uploadDocument.fileDownloadUri : this.expensesModel.uploadDocument;

        this.expensesService.addNewExpenses(expensesModel).pipe(first()).subscribe(data => {
          this.router.navigate(['billing/finance/expenses/all-expenses']);
        });
      },
      error: (err) => console.error('One or more requests failed:', err)
    });
  }

  uploadDoc(uploadDoc) {
    if (uploadDoc) {
      let uploadImageData = new FormData();
      const file = uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("location", "expenses");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }
}
