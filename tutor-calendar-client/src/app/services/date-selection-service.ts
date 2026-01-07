import {computed, Injectable, signal} from '@angular/core';
import {DateAdapter} from '../../core/date-adapter';

export class DateRange<D> {
  constructor(
    readonly start: D | null,
    readonly end: D | null) {
    if (start > end) {
      this.start = end;
      this.end = start;
    }
  }
}

export interface DateSelectionModelChange<S, D> {
  dateRange: S

  selectedDays: Array<D>

  source: unknown

  oldValue?: S
}

@Injectable({providedIn: 'root'})
export class DateSelectionService<D> {
  private readonly _activeMonth = signal<D | null>(null);

  /** Active month signal - lazily initialized with today's date */
  readonly activeMonth = computed(() => {
    const current = this._activeMonth();
    if (current !== null) {
      return current;
    }
    return this.days().length > 0 ? this.days()[0] : this.dateAdapter.today();
  });

  private readonly _selection = signal<D | DateRange<D> | null>(null);

  /** Current selection signal */
  readonly selection = this._selection.asReadonly();

  /** Selected days computed from selection */
  readonly days = computed(() => this.toDays(this._selection()));

  private readonly _lastSelectionChange = signal<DateSelectionModelChange<D | DateRange<D>, D> | null>(null);

  /** Last selection change event (for components that need to react to changes) */
  readonly selectionChanged = this._lastSelectionChange.asReadonly();

  constructor(private dateAdapter: DateAdapter<D>) {
  }

  changeActiveMonth(dir: number): void {
    const current = this.activeMonth();
    const value = this.dateAdapter.addCalendarMonths(current, dir);
    this._activeMonth.set(value);
  }

  updateSelection(value: D | DateRange<D>, source: unknown): void {
    const oldValue = this._selection();
    this._selection.set(value);

    this._lastSelectionChange.set({
      dateRange: value,
      selectedDays: this.toDays(value),
      source,
      oldValue
    });
  }

  private toDays(selection: D | DateRange<D> | null): D[] {
    if (!selection) {
      return [];
    }

    if (selection instanceof DateRange) {
      const range = selection as DateRange<D>;
      return this.dateAdapter.toArray(range.start, range.end);
    } else {
      const day = selection as D;
      return [day];
    }
  }
}
