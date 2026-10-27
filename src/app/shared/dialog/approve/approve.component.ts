import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.sass']
})
export class ApproveDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ApproveDialogComponent>,
  ) { }
  onNoClick(): void {
    this.dialogRef.close();
  }

}