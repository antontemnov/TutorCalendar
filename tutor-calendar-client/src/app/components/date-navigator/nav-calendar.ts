import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  Optional,
  signal
} from '@angular/core';
import {DateAdapter} from '../../../core/date-adapter';
import {DateRange, DateSelectionService} from '../../services/date-selection-service';
import {NavCalendarCell, NavCalendarUserEvent, CalendarBodyComponent} from './nav-calendar-body';
import {DateFormats, NAV_DATE_FORMATS} from '../../../core/date-formats';
import {TitleCasePipe} from '@angular/common';
import {MomentPipe} from '../../shared/moment.pipe';

const DAYS_PER_WEEK = 7;

@Component({
    selector: 'app-nav-calendar',
    templateUrl: './nav-calendar.html',
    styleUrls: ['./nav-calendar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TitleCasePipe, MomentPipe, CalendarBodyComponent]
})
export class NavCalendar<D> {
  readonly weeks = signal<NavCalendarCell[][]>([]);

  readonly weekdays = signal<{ long: string, narrow: string }[]>([]);

  _firstWeekOffset: number;

  private _lastWeekOffset: number;

  // Use signals for range selection (OnPush compatible)
  readonly rangeStart = signal<number | null>(null);
  readonly rangeEnd = signal<number | null>(null);
  readonly isRange = signal<boolean>(false);

  // Preview state (for drag selection visualization)
  private _previewStartValue: number | null = null;

  constructor(public dateSelectionService: DateSelectionService<D>,
              @Optional() public _dateAdapter: DateAdapter<D>,
              @Optional() @Inject(NAV_DATE_FORMATS) public dateFormats: DateFormats) {
    // React to active month changes
    effect(() => {
      const activeMonth = this.dateSelectionService.activeMonth();
      if (activeMonth) {
        this.generate(activeMonth);
      }
    });

    // React to selection changes from service
    effect(() => {
      const event = this.dateSelectionService.selectionChanged();
      if (event) {
        this.selectDateRangeCells(event.dateRange);
      }
    });
  }

  generate(activeMonth): void {
    const firstOfMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(activeMonth),
      this._dateAdapter.getMonth(activeMonth), 1);

    const firstOfNextMonth = this._dateAdapter.addCalendarMonths(firstOfMonth, 1);

    this._firstWeekOffset = (DAYS_PER_WEEK + this._dateAdapter.getDayOfWeek(firstOfMonth) -
      this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;

    this._lastWeekOffset = (DAYS_PER_WEEK - this._dateAdapter.getDayOfWeek(firstOfNextMonth) +
      this._dateAdapter.getFirstDayOfWeek()) % DAYS_PER_WEEK;

    this._initWeekdays();
    this._createWeekCells(activeMonth);
  }

  private _initWeekdays(): void {
    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    const weekdaysArr = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]};
    });
    this.weekdays.set(weekdaysArr.slice(firstDayOfWeek).concat(weekdaysArr.slice(0, firstDayOfWeek)));
  }

  private _createWeekCells(activeMonth): void {
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(activeMonth);
    const newWeeks: NavCalendarCell[][] = [[]];

    const firstWeekStart = this._dateAdapter.getStartOfWeek(
      this._dateAdapter.createDate(
        this._dateAdapter.getYear(activeMonth),
        this._dateAdapter.getMonth(activeMonth), 1));

    for (let i = 0, cell = 0; i < this._firstWeekOffset + daysInMonth + this._lastWeekOffset; i++, cell++) {
      if (cell === DAYS_PER_WEEK) {
        newWeeks.push([]);
        cell = 0;
      }

      const date = this._dateAdapter.addCalendarDays(firstWeekStart, i);
      const cellClasses = [];

      /** Previous month offset cells */
      if (i < this._firstWeekOffset || i >= this._firstWeekOffset + daysInMonth) {
        cellClasses.push('gray-text');
      }

      if (!this._dateAdapter.compareDate(date, this._dateAdapter.today())) {
        cellClasses.push('today');
      }

      const enabled = true;
      const cellValue = this._dateAdapter.getDate(date);

      newWeeks[newWeeks.length - 1].push(new NavCalendarCell<D>(
        cellValue,
        this._getCellCompareValue(date),
        cellValue.toString(),
        enabled,
        cellClasses,
        date));
    }

    this.weeks.set(newWeeks);
  }

  _dateSelected(event: NavCalendarUserEvent<number>): void {
    const selectedDate = this._dateAdapter.parse(event.args);
    this._previewStartValue = null;

    this.dateSelectionService.updateSelection(selectedDate, this);
  }

  _previewChanged(event: NavCalendarUserEvent<NavCalendarCell<D> | null>): void {
    const cellValue = this._getCellCompareValue(event.args.rawValue);

    if (!event.selectionComplete) {
      // Start or continue drag selection
      if (this._previewStartValue === null) {
        // First cell - start of drag, immediately highlight it
        this._previewStartValue = cellValue;
        this.updateRangeSelection(cellValue, cellValue, false);
      } else {
        // Continuing drag - update end point and show range
        this.updateRangeSelection(this._previewStartValue, cellValue, true);
      }
      return;
    }

    // Selection complete (mouseup)
    const startValue = this._previewStartValue ?? cellValue;
    const dateRange = new DateRange<D>(
      this._dateAdapter.parse(startValue),
      this._dateAdapter.parse(cellValue)
    );

    this.dateSelectionService.updateSelection(dateRange, this);
    this._previewStartValue = null;
  }

  private updateRangeSelection(start: number | null, end: number | null, isRange: boolean): void {
    // Ensure start <= end for proper range display
    if (start !== null && end !== null && start > end) {
      this.rangeStart.set(end);
      this.rangeEnd.set(start);
    } else {
      this.rangeStart.set(start);
      this.rangeEnd.set(end);
    }
    this.isRange.set(isRange);
  }

  private selectDateRangeCells(selectedValue: DateRange<D> | D | null): void {
    if (selectedValue instanceof DateRange) {
      this.rangeStart.set(this._getCellCompareValue(selectedValue.start));
      this.rangeEnd.set(this._getCellCompareValue(selectedValue.end));
      this.isRange.set(true);
    } else {
      const value = this._getCellCompareValue(selectedValue);
      this.rangeStart.set(value);
      this.rangeEnd.set(value);
      this.isRange.set(false);
    }
  }

  private _getCellCompareValue(date: D | null): number | null {
    if (date) {
      const year = this._dateAdapter.getYear(date);
      const month = this._dateAdapter.getMonth(date);
      const day = this._dateAdapter.getDate(date);
      return new Date(year, month, day).getTime();
    }

    return null;
  }
}

