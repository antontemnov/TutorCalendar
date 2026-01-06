import {Component} from '@angular/core'
import {PreviewData} from '../../services/timetable-preview.service'
import {Slot} from './timetable-column'

@Component({
    selector: 'app-timetable-preview',
    templateUrl: './timetable-preview.html',
    styleUrls: ['./timetable-preview.scss'],
    standalone: false
})
export class TimetablePreview {
  datekeys: number[] | []

  preview: Slot

  constructor(previewData: PreviewData) {
    this.preview = previewData.preview
    this.datekeys = previewData.datekeys
  }

  _getPreviewSlot(datekey: number): Slot[] {
    if (this.preview.position.datekey === datekey) {
      return [this.preview]
    }
  }
}
