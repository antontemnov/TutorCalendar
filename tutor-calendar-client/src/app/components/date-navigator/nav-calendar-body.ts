import {ChangeDetectionStrategy, Component, input, output, ElementRef, afterNextRender, DestroyRef, NgZone} from '@angular/core'
import {TitleCasePipe} from '@angular/common'

export class NavCalendarCell<D = any> {
  constructor(public value: number,
              public compareValue: number,
              public displayValue: string,
              public enabled: boolean,
              public cssClasses,
              public rawValue?: D) {}
}

export interface NavCalendarUserEvent<D> {
  args: D
  event: Event
  selectionComplete?: boolean
}

@Component({
    selector: 'app-nav-calendar-body',
    templateUrl: 'nav-calendar-body.html',
    styleUrls: ['nav-calendar-body.scss'],
    standalone: true,
    imports: [TitleCasePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarBodyComponent {
  rows = input.required<NavCalendarCell[][]>()

  weekdays = input.required<{long: string, narrow: string}[]>()

  activeCell = input<number>(0)

  isRange = input<boolean>(false)

  startValue = input.required<number>()

  endValue = input.required<number>()

  todayValue = input.required<number>()

  // External preview values from parent (not used internally, just for display)
  previewStartFromParent = input<number | null>(null, { alias: 'previewStart' })
  previewEndFromParent = input<number | null>(null, { alias: 'previewEnd' })

  // Internal mutable preview state
  private _internalPreviewStart: number | null = null
  private _internalPreviewEnd: number | null = null

  readonly previewChange =
    output<NavCalendarUserEvent<NavCalendarCell | null>>()

  readonly selectedValueChange =
    output<NavCalendarUserEvent<number> | null>()

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _destroyRef: DestroyRef,
              private _ngZone: NgZone) {
    afterNextRender(() => {
      const element = _elementRef.nativeElement

      // Регистрируем все события вне Angular зоны для оптимизации
      _ngZone.runOutsideAngular(() => {
        element.addEventListener('mousedown', this._cellMouseDown, true)
        element.addEventListener('mouseup', this._cellMouseUp, true)
        element.addEventListener('mouseover', this._cellMouseOver, true)
        element.addEventListener('mouseleave', this._cellMouseLeave, true)
      })

      _destroyRef.onDestroy(() => {
        element.removeEventListener('mousedown', this._cellMouseDown, true)
        element.removeEventListener('mouseup', this._cellMouseUp, true)
        element.removeEventListener('mouseover', this._cellMouseOver, true)
        element.removeEventListener('mouseleave', this._cellMouseLeave, true)
      })
    })
  }

  private _cellMouseDown = (event: Event) => {
    const cell = this._getCellFromElement(event.target as HTMLElement)
    if (!cell) {
      return
    }

    this._internalPreviewStart = cell.compareValue
    if (cell) {
      // Возвращаемся в Angular зону только для emit события
      this._ngZone.run(() => {
        this.previewChange.emit({
          args: cell,
          event,
          selectionComplete: false})
      })
    }
  }

  private _cellMouseUp = (event: Event) => {
    const cell = this._getCellFromElement(event.target as HTMLElement)
    if (!cell) {
      return
    }

    // Возвращаемся в Angular зону только для emit события
    this._ngZone.run(() => {
      if (cell.compareValue != this._internalPreviewStart) {
        this.previewChange.emit({args: cell, event, selectionComplete: true})
      } else {
        this.selectedValueChange.emit({args: cell.compareValue, event})
      }
    })

    this._internalPreviewStart = null
    this._internalPreviewEnd = null
  }

  private _cellMouseOver = (event: Event) => {
    if (this._internalPreviewStart && isTableCell(event.target as HTMLElement)) {
      const cell = this._getCellFromElement(event.target as HTMLElement)
      if (cell) {
        // Возвращаемся в Angular зону только для emit события
        this._ngZone.run(() => {
          this.previewChange.emit({
            args: cell,
            event,
            selectionComplete: false})
        })
      }
    }
  }

  private _cellMouseLeave = (event: Event) => {
    if (event.target === this._elementRef.nativeElement) {
      // this.previewChange.emit({value: null, event, selectionComplete: true})
    }
  }

  private _getCellFromElement(element: HTMLElement): NavCalendarCell | null {
    let cell: HTMLElement | undefined

    if (isTableCell(element)) {
      cell = element
    } else if (isTableCell(element.parentNode)) {
      cell = element.parentNode as HTMLElement
    }

    if (cell) {
      const row = cell.getAttribute('data-mat-row')
      const col = cell.getAttribute('data-mat-col')

      if (row && col) {
        return this.rows()[parseInt(row)][parseInt(col)]
      }
    }

    return null
  }

  _isSelected(value: number): boolean {
    return !this.isRange() && (this.startValue() === value || this.endValue() === value)
  }

  _isRangeStart(value: number): boolean {
    return isStart(value, this.startValue(), this.endValue())
  }

  _isRangeEnd(value: number): boolean {
    return isEnd(value, this.startValue(), this.endValue())
  }

  _isInRange(value: number): boolean {
    return isInRange(value, this.startValue(), this.endValue(), this.isRange())
  }

  _isActiveCell(rowIndex: number, colIndex: number): boolean {
    const cellNumber = rowIndex * 7 + colIndex
    return cellNumber === this.activeCell()
  }
}

function isStart(value: number, start: number | null, end: number | null): boolean {
  return end !== null && start !== end && value < end && value === start
}

function isEnd(value: number, start: number | null, end: number | null): boolean {
  return start !== null && start !== end && value >= start && value === end
}

function isInRange(value: number,
                   start: number | null,
                   end: number | null,
                   rangeEnabled: boolean): boolean {
  return rangeEnabled && start !== null && end !== null && start !== end &&
    value >= start && value <= end
}

function isTableCell(node: Node) {
  return (node as HTMLElement).getAttribute('role') === 'cell'
}

