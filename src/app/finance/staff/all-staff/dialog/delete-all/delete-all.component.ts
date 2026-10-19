import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteAll } from '../../../../staff/staff.model';
import { SessionModel } from '../../../../../session/session.model';
import { SessionService } from '../../../../../session/session.service';
@Component({
  selector: 'app-delete-all',
  templateUrl: './delete-all.component.html',
  styleUrls: ['./delete-all.component.sass']
})

export class DeleteAllDialogComponent {
  sessionYearList: SessionModel[];

  constructor(
    public dialogRef: MatDialogRef<DeleteAllDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteAll,
    private sessionService: SessionService,
  ) {
    this.sessionService.getAllCurrentAndUpcomingSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
