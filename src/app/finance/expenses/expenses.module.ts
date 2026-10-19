import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddExpensesComponent } from './add-expenses/add-expenses.component';
import { AllExpensesComponent } from './all-expenses/all-expenses.component';
import { AllUnapproveExpensesComponent } from './all-unApproveExpenses/all-unApproveExpenses.component';

import { ExpensesRoutingModule } from './expenses-routing.module';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  declarations: [AddExpensesComponent, AllExpensesComponent, AllUnapproveExpensesComponent],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMenuModule,
    MaterialFileInputModule,
    MatSlideToggleModule,
    CustomMaterialModule,
    NgxMaterialTimepickerModule,
    PerfectScrollbarModule,
    NgxMaskModule,
  ]
})
export class ExpensesModule { }
