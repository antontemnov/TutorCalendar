import {Injectable} from '@angular/core'
import {DateAdapter} from '../../core/date-adapter'
import {BehaviorSubject, Observable, Subject} from 'rxjs'

export class DateRange<D> {
  constructor(
    readonly start: D | null,
    readonly end: D | null) {
    if (start > end) {
      this.start = end
      this.end = start
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
  get activeMonth$(): BehaviorSubject<D> {
    this._activeMonth$ = this._activeMonth$ || new BehaviorSubject<D>(this.days.length > 0 ?
      this.days[0] :
      this.dateAdapter.today())

    return this._activeMonth$
  }
  private _activeMonth$: BehaviorSubject<D>

  get selection(): D | DateRange<D> {
    return this._selection
  }
  private _selection: D | DateRange<D>

  get days(): D[] {
    return this.toDays(this.selection)
  }

  private readonly _selectionChanged = new Subject<DateSelectionModelChange<D | DateRange<D>, D>>()

  selectionChanged: Observable<DateSelectionModelChange<D | DateRange<D>, D>> = this._selectionChanged

   constructor(private dateAdapter: DateAdapter<D>) {
   }

  changeActiveMonth(dir: number) {
    const value = this.dateAdapter.addCalendarMonths(this.activeMonth$.value, dir)
    this.activeMonth$.next(value)
  }

  updateSelection(value: D | DateRange<D>, source: unknown) {
    const oldValue = (this as {selection: D | DateRange<D>}).selection
    this._selection = value

    this._selectionChanged.next({
      dateRange: value,
      selectedDays: this.toDays(value),
      source,
      oldValue
    })
  }

  ngOnDestroy() {
    this._selectionChanged.complete()
  }

  private toDays(selection: D | DateRange<D> | null): D[] {
    if (!selection) {
      return []
    }

    if (selection instanceof DateRange) {
      const range = selection as DateRange<D>
      return this.dateAdapter.toArray(range.start, range.end)
    } else {
      const day = selection as D
      return [day]
    }
  }
}
