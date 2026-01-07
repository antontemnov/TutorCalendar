import {ElementRef, Inject, Injectable} from '@angular/core';
import {END_TIMELINE, START_TIMELINE, MAIN_TIMELINE_STEP} from '../shared/constants';
import {Time} from '../components/timetable/model/time-model';

const MINUTES_PER_HOUR = 60;

@Injectable({providedIn: 'root'})
export class TimelineService {
  constructor(@Inject(MAIN_TIMELINE_STEP) readonly mainTimestep: number,
              @Inject(START_TIMELINE) private readonly startTimeline: Time,
              @Inject(END_TIMELINE) private readonly endTimeline: Time) { }

  private _mainTimeline: Time[] = [];
  get mainTimeline(): Time[] {
    return this._mainTimeline.length ? {...this._mainTimeline} : this.createTimeline(this.mainTimestep);
  }

  get slotPrecision(): number {
    return this.mainTimestep / 2;
  }

  get previewPrecision(): number {
    return this.mainTimestep / 4;
  }

  get maxUnderlineTime(): Time {
    return this.endTimeline.addMinutes(this.mainTimestep);
  }

  createTimeline(step: number): Time[] {
    const scale = [this.startTimeline.clone()];
    const lastTimePoint = () => scale[scale.length - 1];
    while (lastTimePoint().hour < this.endTimeline.hour) {
      scale.push(lastTimePoint().addMinutes(step));
    }
    return scale;
  }

  getTimeByTopOffset(timelineRef: ElementRef<HTMLElement>, offsetY: number, precision: number = this.slotPrecision): Time | null {
    const timePointsRect = timelineRef.nativeElement.getBoundingClientRect();

    const timelineOffsetY = Math.floor(offsetY - timePointsRect.top);
    const timePointHeightPx = Math.round(timePointsRect.height / this.mainTimeline.length);

    const selectedPointRatio = (timelineOffsetY / timePointHeightPx);

    if (selectedPointRatio < 0) {
      return this.mainTimeline[0];
    }

    if (Math.trunc(selectedPointRatio) > this.mainTimeline.length - 1) {
      return this.maxUnderlineTime;
    }

    const selectedTimePoint = this.mainTimeline[Math.trunc(selectedPointRatio)];

    const selectedPointMinuteRatio = selectedPointRatio - Math.trunc(selectedPointRatio);
    const selectedMinutes = Math.trunc(selectedPointMinuteRatio % 1 * this.mainTimestep);

    const selectedTime = selectedTimePoint.addMinutes(selectedMinutes);

    const selectedMinutesWithPrecision = Math.trunc(selectedTime.minute / precision) * precision;

    return new Time(selectedTime.hour, selectedMinutesWithPrecision);
  }

  getTopOffset(timelineRef: ElementRef<HTMLElement>, time: Time): number {
    const timePointsRect = timelineRef.nativeElement.getBoundingClientRect();

    const timePointHeightPx = Math.round(timePointsRect.height / this.mainTimeline.length);

    const minutesOffset = (time.hour - this.mainTimeline[0].hour) * MINUTES_PER_HOUR + time.minute;

    const offsetPx = minutesOffset * timePointHeightPx / this.mainTimestep;

    return offsetPx;
  }
}
