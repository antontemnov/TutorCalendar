import {DateFormats} from '../date-formats';

export const DATETIME_FORMAT = 'DD.MM.YYYY hh:mm';
export const HTML_DATE_FORMAT = 'YYYYMMDD';

export const NAV_MOMENT_DATE_FORMATS: DateFormats = {
  parse: {
    dateInput: 'l',
  },
  display: {
    dateInput: 'l',
    monthYearLabel: 'MMM YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
    // dateA11yLabel: 'LL',
  },
};
