import {inject, InjectionToken, LOCALE_ID} from '@angular/core';

export const NAV_DATE_LOCALE = new InjectionToken<{}>('NAV_DATE_LOCALE', {
  providedIn: 'root',
  factory: NAV_DATE_LOCALE_FACTORY,
});

export function NAV_DATE_LOCALE_FACTORY(): {} {
  return inject(LOCALE_ID);
}

export abstract class DateAdapter<D, L = any> {
  protected locale: L;

  abstract createDate(year: number, month: number, date: number, hour?: number, minute?: number, second?: number): D

  abstract clone(date: D): D

  abstract isDateInstance(obj: any): boolean

  abstract isValid(date: D): boolean

  abstract invalid(): D

  abstract addCalendarDays(date: D, days: number): D

  abstract addCalendarMonths(date: D, months: number): D

  abstract addCalendarTime(date: D, times: number, type: 'hours' | 'minutes' | 'seconds'): D

  abstract parse(value: any, parseFormat?: any): D | null

  abstract toArray(startDate: D, endDate: D): Array<D> | null

  abstract today(): D

  abstract getStartOfWeek(date: D): D

  abstract getYear(date: D): number

  abstract getMonth(date: D): number

  abstract getHour(date: D): number

  abstract getMinute(date: D): number

  abstract format(date: D, displayFormat: string): string

  abstract getDate(date: D): number

  abstract getDateKey(date: D): number

  abstract getDateByKey(key: number): D

  abstract getDayOfWeek(date: D): number

  abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[]

  abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[]

  abstract getFirstDayOfWeek(): number

  abstract getNumDaysInMonth(date: D): number

  protected setLocale(locale: L): void {
    this.locale = locale;
  }

  deserialize(value: any): D | null {
    if (value == null || this.isDateInstance(value) && this.isValid(value)) {
      return value;
    }
    return this.invalid();
  }

  getValidDateOrNull(obj: unknown): D | null {
    return this.isDateInstance(obj) && this.isValid(obj as D) ? obj as D : null;
  }

  compareDate(first: D, second: D): number {
    return this.getYear(first) - this.getYear(second) ||
      this.getMonth(first) - this.getMonth(second) ||
      this.getDate(first) - this.getDate(second);
  }

  sameDate(first: D | null, second: D | null): boolean {
    if (first && second) {
      const firstValid = this.isValid(first);
      const secondValid = this.isValid(second);
      if (firstValid && secondValid) {
        return !this.compareDate(first, second);
      }
      return firstValid === secondValid;
    }
    return first === second;
  }
}
