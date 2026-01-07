import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
    selector: 'app-timetable-slot',
    templateUrl: './timetable-slot.html',
    styleUrls: ['./timetable-slot.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableSlot {
  title = input.required<string>();

  timeRangeTitle = input.required<string>();
}
