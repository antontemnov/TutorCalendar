import {Injectable} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TimetablePreviewService} from './timetable-preview.service';

@Injectable({providedIn: 'root'})
export class ModalService {
  constructor(private dialogRef: MatDialog) {
  }

  open<T, D = any, R = any>(component: ComponentType<T>, data?: D): MatDialogRef<T, R> {
    const dialogRef = this.dialogRef.open(component, {
      data,
      panelClass: 'dialog-container',
    });

    // return dialogRef
    //   .afterClosed()
    //   .subscribe((arg) => {
    //     console.log('Back from the dialog', arg)
    //     Promise.resolve(promise)
    //   })

    return dialogRef;
  }
}
