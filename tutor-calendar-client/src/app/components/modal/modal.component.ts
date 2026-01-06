import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    standalone: false
})
export class ModalComponent<TComponent, TData> implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TComponent>,
    @Inject(MAT_DIALOG_DATA) private initialData: TData) {
  }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close()
  }

  save() {
    this.dialogRef.close(this.initialData)
  }
}
