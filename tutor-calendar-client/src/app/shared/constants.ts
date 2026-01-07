import {InjectionToken} from '@angular/core';
import {Time} from '../components/timetable/model/time-model';

const MAIN_TIMELINE_STEP_VALUE = 60;
const START_TIMELINE_VALUE = new Time(7, 0);
const END_TIMELINE_VALUE = new Time(23, 0);

export const MAIN_TIMELINE_STEP = new InjectionToken('Base Time line step', {
  providedIn: 'root',
  factory: () => MAIN_TIMELINE_STEP_VALUE
});

export const START_TIMELINE = new InjectionToken('Base Time line step', {
  providedIn: 'root',
  factory: () => START_TIMELINE_VALUE
});

export const END_TIMELINE = new InjectionToken('Base Time line step', {
  providedIn: 'root',
  factory: () => END_TIMELINE_VALUE
});
