import { Component, OnInit } from '@angular/core';
import { CustomerModel } from '../customer.model';
import { UtilsService } from '../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../customer.service';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../shared/services/CompressImageService';

@Component({
  selector: 'app-about-customer',
  templateUrl: './about-customer.component.html',
  styleUrls: ['./about-customer.component.sass']
})
export class AboutCustomerComponent implements OnInit {

  customer: CustomerModel;
  genderMap: Map<number, string> = new Map<number, string>();
  showDateFormat: string;

  apiURL: string = environment.apiUrl;
  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['pages/customers/all-customers']);
    }
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.showDateFormat = settings.SHOW_DATE_FORMAT;

    
    this.customer = history.state.customer;

    this.utilsService.getAllGender()
      .subscribe(data => data.forEach(element => this.genderMap.set(element.id, element.name)));
  }

  updateCustomerUrl(event, row) {
    event.target.src = row.gender == 1 ? "assets/images/user/male_teacher_avatar.png" : "assets/images/user/female_teacher_avatar.png";
  }

}
