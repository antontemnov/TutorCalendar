import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import {ActivityAddDialogData, ActivityAddDialogResult} from './activity-dialog-model'
import {Time, TimeRange} from '../timetable/model/time-model'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {TimetablePreviewService} from '../../services/timetable-preview.service'

@Component({
    selector: 'app-activity-add-dialog',
    templateUrl: './activity-add-dialog.html',
    styleUrls: ['./activity-add-dialog.scss'],
    standalone: false
})
export class ActivityAddDialog {
  form: FormGroup

  constructor(
    public dialogRef: MatDialogRef<ActivityAddDialog>,
    @Inject(MAT_DIALOG_DATA) private initialData: ActivityAddDialogData,
    private readonly _previewService: TimetablePreviewService) {

    this.form = new FormGroup({
      title: new FormControl<string>(initialData.slot.title, [
        Validators.required,
      ]),
      timeRange: new FormControl<TimeRange>(initialData.slot.timeRange),
    })

    this.form.controls['timeRange'].valueChanges.subscribe(value => {
      this.changeTimeRange(value)
    })
  }

  get title() {
    return this.form.controls.title as FormControl
  }

  changeTimeRange(value: TimeRange) {
    if (!value) {
      return
    }

    this.initialData.slot.timeRange = value
    this._previewService.setPreview(this.initialData.slot)
  }

  submit() {
    this.dialogRef.close(new ActivityAddDialogResult(this.initialData.slot))
  }
}
