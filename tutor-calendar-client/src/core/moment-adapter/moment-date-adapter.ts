import {DateAdapter, NAV_DATE_LOCALE} from '../date-adapter';
import * as moment from 'moment';
import {Inject, Injectable, Optional} from '@angular/core';
import {NAV_DATE_FORMATS} from '../date-formats';

@Injectable()
export class MomentDateAdapter extends DateAdapter<moment.Moment> {
  private _localeData: {
    firstDayOfWeek: number,
    longMonths: string[],
    shortMonths: string[],
    longDaysOfWeek: string[],
    shortDaysOfWeek: string[],
    narrowDaysOfWeek: string[]
  };

  private readonly _minDate;

  constructor(@Optional() @Inject(NAV_DATE_LOCALE) dateLocale: string) {
    super();
    this.setLocale(dateLocale || moment.locale());
    this._minDate = this.createDate(1949, 4, 19);
  }

  setLocale(locale: any): void {
    super.setLocale(locale);
    const momentLocaleData = moment.localeData(locale);

    this._localeData = {
      firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
      longMonths: momentLocaleData.months(),
      shortMonths: momentLocaleData.monthsShort(),
      longDaysOfWeek: momentLocaleData.weekdays(),
      shortDaysOfWeek: momentLocaleData.weekdaysShort(),
      narrowDaysOfWeek: momentLocaleData.weekdaysMin()
    };
  }

  deserialize(value: any): moment.Moment | null {
    let date;
    if (value instanceof Date) {
      date = moment(value).locale(this.locale);
    } else if (this.isDateInstance(value)) {
      return this.clone(value);
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = moment(value, moment.ISO_8601).locale(this.locale);
    }
    if (date && this.isValid(date)) {
      return moment(date).locale(this.locale);
    }
    return super.deserialize(value);
  }

  addCalendarDays(date: moment.Moment, days: number): moment.Moment {
    return this.clone(date).add({days});
  }

  addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
    return this.clone(date).add({months});
  }

  addCalendarTime(date: moment.Moment, times: number, type: 'hours' | 'minutes' | 'seconds'): moment.Moment {
    return this.clone(date).add(times, type);
  }

  clone(date: moment.Moment): moment.Moment {
    return date.clone().locale(this.locale);
  }

  createDate(year: number, month: number, date: number, hour: number = 0, minute: number = 0, second: number = 0): moment.Moment {
    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    }

    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }

    return moment({year, month, date, hour, minute, second}).locale(this.locale);
  }

  getDate(date: moment.Moment): number {
    return this.clone(date).date();
  }

  getDateKey(date: moment.Moment): number {
    return this.clone(date).diff(this._minDate, 'days');
  }

  getDateByKey(key: number): moment.Moment {
    const date = this.addCalendarDays(this.clone(this._minDate), key);
    return this.createDate(this.getYear(date), this.getMonth(date), this.getDate(date));
  }

  getHour(date: moment.Moment): number {
    return this.clone(date).hour();
  }

  getMinute(date: moment.Moment): number {
    return this.clone(date).minute();
  }

  getDayOfWeek(date: moment.Moment): number {
    return this.clone(date).day();
  }

  getStartOfWeek(date: moment.Moment): moment.Moment {
    return this.clone(date).startOf('isoWeek');
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style === 'long') {
      return this._localeData.longDaysOfWeek;
    }
    if (style === 'short') {
      return this._localeData.shortDaysOfWeek;
    }
    return this._localeData.narrowDaysOfWeek;
  }

  getFirstDayOfWeek(): number {
    return this._localeData.firstDayOfWeek;
  }

  getNumDaysInMonth(date: moment.Moment): number {
    return this.clone(date).daysInMonth();
  }

  getMonth(date: moment.Moment): number {
    return this.clone(date).month();
  }

  format(date: moment.Moment, displayFormat: string): string {
    date = this.clone(date);
    return date.format(displayFormat);
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return style === 'long' ? this._localeData.longMonths : this._localeData.shortMonths;
  }

  getYear(date: moment.Moment): number {
    return this.clone(date).year();
  }

  invalid(): moment.Moment {
    return moment.invalid();
  }

  isDateInstance(obj: any): boolean {
    return moment.isMoment(obj);
  }

  isValid(date: moment.Moment): boolean {
    return this.clone(date).isValid();
  }

  parse(value: any, parseFormat: any = NAV_DATE_FORMATS): moment.Moment | null {
    if (value && typeof value === 'string') {
      return moment(value, parseFormat, this.locale);
    }
    return value ? moment(value).locale(this.locale) : null;
  }

  toArray(startDate: moment.Moment, endDate: moment.Moment): Array<moment.Moment> | null {
    const array = [];
    while (startDate <= endDate) {
      array.push(this.clone(startDate));
      startDate = this.addCalendarDays(startDate, 1);
    }
    return array;
  }

  today(): moment.Moment {
    return moment().locale(this.locale);
  }
}
