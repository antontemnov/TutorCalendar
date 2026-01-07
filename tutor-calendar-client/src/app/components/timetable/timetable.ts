import {AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UpperCasePipe} from '@angular/common';
import {Time} from './model/time-model';
import {ColumnDay, TimetableColumnActionEventArgs, TimetableColumn} from './timetable-column';
import {TimetablePreviewService} from '../../services/timetable-preview.service';
import {ActivityAddDialog} from '../activity-add-dialog/activity-add-dialog';
import {ActivityAddDialogData, ActivityAddDialogResult} from '../activity-add-dialog/activity-dialog-model';
import {TimelineService} from '../../services/timeline.service';
import {ModalService} from '../../services/modal.service';
import {DateRange, DateSelectionService} from '../../services/date-selection-service';
import {DateAdapter} from '../../../core/date-adapter';
import {ActivityClient} from '../../shared/activity-client';

export interface TimetableUserEvent<T> {
  args: T
}

@Component({
    selector: 'app-timetable',
    templateUrl: './timetable.html',
    styleUrls: ['./timetable.scss'],
    standalone: true,
    imports: [UpperCasePipe, TimetableColumn],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Timetable<D> implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('timeline') timelineRef: ElementRef<HTMLElement>;

  @ViewChild('columnsContainer') columnsContainerRef: ElementRef<HTMLElement>;

  readonly columns = signal<ColumnDay<D>[] | null>(null);

  get mainTimeline(): Time[] {
    return this._timelineService.mainTimeline;
  }

  constructor(private readonly _timelineService: TimelineService,
              private readonly dateSelectionService: DateSelectionService<D>,
              private readonly _previewService: TimetablePreviewService,
              private readonly dialogService: ModalService,
              private readonly activityClient: ActivityClient,
              private _dateAdapter: DateAdapter<D>) {
    // React to selection changes using effect
    effect(() => {
      const event = this.dateSelectionService.selectionChanged();
      if (!event) return;

      const newColumns = event.selectedDays.map(day => this.toColumnDay(day));
      this.columns.set(newColumns);

      this.activityClient.load(event.selectedDays.map(day => this._dateAdapter.getDateKey(day)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    });

    // React to columns changes to update preview service binding
    effect(() => {
      const cols = this.columns();
      if (this.columnsContainerRef && this.timelineRef) {
        this._previewService.bind(cols?.map(c => c.datekey) ?? [], this.columnsContainerRef, this.timelineRef);
      }
    });
  }

  ngOnInit(): void {
    this.dateSelectionService.updateSelection(
      new DateRange<D>(this._dateAdapter.today(),
        this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 2)),
      this);
  }

  ngAfterViewInit(): void {
    this._previewService.bind(this.columns()?.map(c => c.datekey) ?? [], this.columnsContainerRef, this.timelineRef);
  }

  _previewChanged(event: TimetableUserEvent<TimetableColumnActionEventArgs>): void {
    const adjustedTime = this._timelineService.getTimeByTopOffset(
      this.timelineRef,
      event.args.clientY,
      this._timelineService.previewPrecision);

    if (event.args.action === 'selection') {
      this._previewService.drawPreview(event.args.datekey, adjustedTime);
      return;
    }

    if (event.args.action === 'click') {
      this._previewService.drawPreview(event.args.datekey, adjustedTime);
      this._previewService.drawPreview(event.args.datekey, adjustedTime.addMinutes(this._timelineService.slotPrecision));
      const slotPreview = this._previewService.getPreview(event.args.datekey);
      this.openActivityAddDialog({slot: slotPreview});
    }

    if (event.args.action === 'selectionEnd') {
      const slotPreview = this._previewService.getPreview(event.args.datekey);
      this.openActivityAddDialog({slot: slotPreview});
    }
  }

  private openActivityAddDialog(data: ActivityAddDialogData): void {
    const dialogRef = this.dialogService.open(ActivityAddDialog, data);

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dialogResult: ActivityAddDialogResult) => {
        if (dialogResult) {
          const cols = this.columns();
          const columnIndex = cols?.findIndex(c => c.datekey === dialogResult.slot.position.datekey);
          if (columnIndex !== undefined && columnIndex >= 0) {
            // Create new column with new slots array for immutability (OnPush compatibility)
            const column = cols![columnIndex];
            const updatedColumn = new ColumnDay(
              column.value,
              column.title,
              column.weekday,
              column.datekey,
              column.rawValue,
              [...column.slots, dialogResult.slot]
            );
            const updatedCols = [...cols!];
            updatedCols[columnIndex] = updatedColumn;
            this.columns.set(updatedCols);

            this.activityClient.updateOrCreateBySlot(dialogResult.slot);
          }
        }
        this._previewService.cleanupPreview();
      });
  }

  private toColumnDay(day: D): ColumnDay<D> {
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
    const weekdays = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]};
    });

    return new ColumnDay<D>(
      this._dateAdapter.getDate(day),
      this._dateAdapter.format(day, 'DD'),
      weekdays[this._dateAdapter.getDayOfWeek(day)],
      this._dateAdapter.getDateKey(day),
      day,
      []);
  }
}
