import { Component, OnInit } from '@angular/core';
import { VendorModel } from '../vendor.model';
import { UtilsService } from '../../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VendorService } from '../vendor.service';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../../shared/services/CompressImageService';

@Component({
  selector: 'app-about-vendor',
  templateUrl: './about-vendor.component.html',
  styleUrls: ['./about-vendor.component.sass']
})
export class AboutVendorComponent implements OnInit {

  vendor: VendorModel;
  showDateFormat: string;

  apiURL: string = environment.apiUrl;
  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(
    private vendorService: VendorService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['billing/finance/vendors/all-vendors']);
    }
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.vendor = history.state.vendor;

  }

  updateVendorUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }

}
