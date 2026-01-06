import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {UpperCasePipe} from '@angular/common'
import {Time} from './model/time-model'
import {ColumnDay, TimetableColumnActionEventArgs, TimetableColumn} from './timetable-column'
import {TimetablePreviewService} from '../../services/timetable-preview.service'
import {ActivityAddDialog} from '../activity-add-dialog/activity-add-dialog'
import {ActivityAddDialogData, ActivityAddDialogResult} from '../activity-add-dialog/activity-dialog-model'
import {TimelineService} from '../../services/timeline.service'
import {ModalService} from '../../services/modal.service'
import {DateRange, DateSelectionService} from '../../services/date-selection-service'
import {Subscription} from 'rxjs'
import {DateAdapter} from '../../../core/date-adapter'
import {ActivityClient} from '../../shared/activity-client'

export interface TimetableUserEvent<T> {
  args: T
}

@Component({
    selector: 'app-timetable',
    templateUrl: './timetable.html',
    styleUrls: ['./timetable.scss'],
    standalone: true,
    imports: [UpperCasePipe, TimetableColumn]
})
export class Timetable<D> implements OnInit, AfterViewInit, OnDestroy {
  private _dateNavigatorSelectionChangedSubscription = Subscription.EMPTY

  @ViewChild('timeline') timelineRef: ElementRef<HTMLElement>

  @ViewChild('columnsContainer') columnsContainerRef: ElementRef<HTMLElement>

  get columns() {
    return this._columns
  }
  set columns(val: ColumnDay<D>[] | null) {
    this._columns = val
    this._previewService.bind(this._columns?.map(c => c.datekey) ?? [], this.columnsContainerRef, this.timelineRef)
  }
  _columns: ColumnDay<D>[] | null

  get mainTimeline(): Time[] {
    return this._timelineService.mainTimeline
  }

  constructor(private readonly _timelineService: TimelineService,
              private readonly dateSelectionService: DateSelectionService<D>,
              private readonly _previewService: TimetablePreviewService,
              private readonly dialogService: ModalService,
              private readonly activityClient: ActivityClient,
              private _dateAdapter: DateAdapter<D>) {
    this.subscribeOnSelectionChanged()
  }

  ngOnInit(): void {
    // TODO: temp line
     this.dateSelectionService.updateSelection(
       new DateRange<D>(this._dateAdapter.today(),
         this._dateAdapter.addCalendarDays(this._dateAdapter.today(),
           2)), this)
  }

  ngAfterViewInit() {
    this._previewService.bind(this.columns?.map(c => c.datekey) ?? [], this.columnsContainerRef, this.timelineRef)
  }

  _previewChanged(event: TimetableUserEvent<TimetableColumnActionEventArgs>) {
    const adjustedTime = this._timelineService.getTimeByTopOffset(
      this.timelineRef,
      event.args.clientY,
      this._timelineService.previewPrecision)

    if (event.args.action === 'selection') {
      this._previewService.drawPreview(event.args.datekey, adjustedTime)
      return
    }

    if (event.args.action === 'click') {
      this._previewService.drawPreview(event.args.datekey, adjustedTime)
      this._previewService.drawPreview(event.args.datekey, adjustedTime.addMinutes(this._timelineService.slotPrecision))
      const slotPreview = this._previewService.getPreview(event.args.datekey)
      this.openActivityAddDialog({slot: slotPreview})
    }

    if (event.args.action === 'selectionEnd') {
      const slotPreview = this._previewService.getPreview(event.args.datekey)
      this.openActivityAddDialog({slot: slotPreview})
    }
  }

  private openActivityAddDialog(data: ActivityAddDialogData): void {
    const dialogRef = this.dialogService.open(ActivityAddDialog, data)

    dialogRef.afterClosed()
      .subscribe((dialogResult: ActivityAddDialogResult) => {
        if (dialogResult) {
          const column = this.columns.find(c => c.datekey === dialogResult.slot.position.datekey)
          if (column) {
            column.slots.push(dialogResult.slot)

            this.activityClient.updateOrCreateBySlot(dialogResult.slot)
          }
        }
        this._previewService.cleanupPreview()
      })
  }

  private subscribeOnSelectionChanged(): void {
    this._dateNavigatorSelectionChangedSubscription.unsubscribe()
    this._dateNavigatorSelectionChangedSubscription = this.dateSelectionService.selectionChanged
      .subscribe(event => {
        this.columns = event.selectedDays.map(day => this.toColumnDay(day))

        this.activityClient.load(event.selectedDays.map(day => this._dateAdapter.getDateKey(day)))
          .subscribe(
            activities => {
              // this.columns = activities.map(activity => this.toColumnDay(activity))
              console.log('Completed!!', activities)
            }
          )
    })
  }

  private toColumnDay(day: D): ColumnDay<D> {
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow')
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long')
    const weekdays = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]}
    })

    return new ColumnDay<D>(
      this._dateAdapter.getDate(day),
      this._dateAdapter.format(day, 'DD'),
      weekdays[this._dateAdapter.getDayOfWeek(day)],
      this._dateAdapter.getDateKey(day),
      day,
      [])
  }

  ngOnDestroy(): void {
    this._dateNavigatorSelectionChangedSubscription.unsubscribe()
  }
}
