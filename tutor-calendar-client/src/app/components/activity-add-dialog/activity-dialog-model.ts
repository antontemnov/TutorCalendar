import {Slot} from '../timetable/timetable-column';

export interface ActivityAddDialogData {
  slot: Slot
}

export class ActivityAddDialogResult {
  constructor(public slot: Slot) { }
}
