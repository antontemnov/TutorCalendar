import {Component, Input, OnInit} from '@angular/core'

@Component({
    selector: 'app-timetable-slot',
    templateUrl: './timetable-slot.html',
    styleUrls: ['./timetable-slot.scss'],
    standalone: false
})
export class TimetableSlot implements OnInit {
  @Input() title: string

  @Input() timeRangeTitle: string

  constructor() { }

  ngOnInit(): void {
  }
}
