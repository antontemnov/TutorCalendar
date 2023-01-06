import {Inject, Optional, Pipe, PipeTransform} from '@angular/core'
import {DateAdapter} from '../../core/date-adapter'
import {DateFormats, NAV_DATE_FORMATS} from '../../core/date-formats'

@Pipe({
  name: 'moment'
})
export class MomentPipe implements PipeTransform {
  constructor(@Optional() @Inject(NAV_DATE_FORMATS) private dateFormats: DateFormats,
              @Optional() private dateAdapter: DateAdapter<any>) {
  }

  transform<D>(date: D, format: string = this.dateFormats.display.dateInput): string {
    if (date && format) {
     return this.dateAdapter.format(date, format)
    }
  }
}
