import {InjectionToken} from '@angular/core'

export type DateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
    monthLabel?: any,
    monthYearLabel: any,
    monthYearA11yLabel: any,
  }
}

export const NAV_DATE_FORMATS = new InjectionToken<DateFormats>('nav-date-formats')
