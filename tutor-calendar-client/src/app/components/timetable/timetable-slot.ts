import {Component, input, OnInit} from '@angular/core'

@Component({
    selector: 'app-timetable-slot',
    templateUrl: './timetable-slot.html',
    styleUrls: ['./timetable-slot.scss'],
    standalone: true
})
export class TimetableSlot implements OnInit {
  title = input.required<string>()

  timeRangeTitle = input.required<string>()

  constructor() { }

  ngOnInit(): void {
  }
}
