import {Component, ElementRef, Inject, input, output, afterNextRender, DestroyRef} from '@angular/core'
import {TimetableUserEvent} from './timetable'
import {TimeRange} from './model/time-model'
import {DOCUMENT} from '@angular/common'
import {TimetableSlot} from './timetable-slot'

export class ColumnDay<D = any> {
  constructor(public value: number,
              public title: string,
              public weekday: { long: string, narrow: string },
              public datekey: number,
              public rawValue: D,
              public slots: Slot[] = []) {
  }
}

export interface ISlotPosition {
  datekey: number
  top: number,
  height: number
}

export class Slot {
  constructor(public title: string,
              public timeRange: TimeRange | null,
              public position: ISlotPosition) { }

  copy(): Slot {
    return new Slot(this.title, new TimeRange(this.timeRange.start, this.timeRange.end), this.position)
  }
}

export class TimetableColumnActionEventArgs {
  constructor(public datekey: number,
              public clientY: number,
              public action: 'click' | 'selection' | 'selectionEnd') {
  }
}

const FIRING_EVENT_THRESHOLD = 5

@Component({
    selector: 'app-timetable-column',
    templateUrl: './timetable-column.html',
    styleUrls: ['./timetable-column.scss'],
    standalone: true,
    imports: [TimetableSlot]
})
export class TimetableColumn {

  datekey = input.required<number>()

  slots = input<Slot[]>([])

  readonly selectionChanged =
    output<TimetableUserEvent<TimetableColumnActionEventArgs> | null>()

  private _startMouseDownY: number | null

  private _lastMouseDownY: number | null

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _ngZone: NgZone,
              @Inject(DOCUMENT) private document: Document) {
    _ngZone.runOutsideAngular(() => {
        const element = _elementRef.nativeElement
        element.addEventListener('mousedown', this._columnMouseDown, true)
      }
    )
  }

  private _columnMouseDown = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).getAttribute('data-datekey')) {
      return
    }

    this._lastMouseDownY = this._startMouseDownY = event.clientY

    this._emitSelectionChangedEvent(event)

    this._ngZone.runOutsideAngular(() => {
      this.document.addEventListener('mousemove', this._mouseMoveHandler, true)
      this.document.addEventListener('mouseup', this._mouseUpHandler, true)
    })
  }

  private _mouseMoveHandler = (e: MouseEvent) => this._threshold(this._emitSelectionChangedEvent, FIRING_EVENT_THRESHOLD, e)

  private _mouseUpHandler = (e: MouseEvent) => {
    this.document.removeEventListener('mousemove', this._mouseMoveHandler, true)
    this.document.removeEventListener('mouseup', this._mouseUpHandler, true)
    this._emitSelectionChangedEvent(e)

    this._lastMouseDownY = this._startMouseDownY = null
  }

  private _emitSelectionChangedEvent = (event: MouseEvent) => {
    let action = null
    if (event.type === 'mouseup') {
      action = Math.abs(this._lastMouseDownY - this._startMouseDownY) < FIRING_EVENT_THRESHOLD ? 'click' : 'selectionEnd'
      this.document.body.removeAttribute('data-preview-mode')
    }

    if (event.type === 'mousemove' || event.type === 'mousedown') {
      action = 'selection'
      this.document.body.setAttribute('data-preview-mode', 'true')
    }

    if (!action) {
      return
    }

    this._ngZone.run(() => this.selectionChanged.emit({
      args: new TimetableColumnActionEventArgs(
        this.datekey(),
        event.clientY,
        action),
    }))
  }

  private _threshold = (fn: Function, threshold: number, event: MouseEvent) => {
    if (Math.abs((this._lastMouseDownY ?? 0) - event.clientY) > threshold) {
      this._lastMouseDownY = event.clientY
      fn(event)
    }
  }
}
