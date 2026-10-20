import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { SessionService } from '../../../../session/session.service';
import { SessionModel } from '../../../../session/session.model';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.sass']
})
export class DeleteDialogComponent {
  sessionYearList: SessionModel[];

  constructor(
    private sessionService: SessionService,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.sessionService.getAllCurrentAndUpcomingSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
