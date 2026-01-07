import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    standalone: true,
    imports: [MatDialogModule, DragDropModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent<TComponent, TData> {
  constructor(
    public dialogRef: MatDialogRef<TComponent>,
    @Inject(MAT_DIALOG_DATA) private initialData: TData) {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.initialData);
  }
}
