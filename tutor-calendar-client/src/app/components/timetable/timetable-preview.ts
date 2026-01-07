import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core'
import {PreviewData} from '../../services/timetable-preview.service'
import {Slot, TimetableColumn} from './timetable-column'

@Component({
    selector: 'app-timetable-preview',
    templateUrl: './timetable-preview.html',
    styleUrls: ['./timetable-preview.scss'],
    standalone: true,
    imports: [TimetableColumn],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetablePreview {
  private readonly cdr = inject(ChangeDetectorRef)

  datekeys: number[] | []

  private _preview: Slot

  get preview(): Slot {
    return this._preview
  }

  set preview(value: Slot) {
    this._preview = value
    this.cdr.markForCheck()
  }

  constructor(previewData: PreviewData) {
    this._preview = previewData.preview
    this.datekeys = previewData.datekeys
  }

  _getPreviewSlot(datekey: number): Slot[] {
    if (this._preview.position.datekey === datekey) {
      return [this._preview]
    }
  }
}
