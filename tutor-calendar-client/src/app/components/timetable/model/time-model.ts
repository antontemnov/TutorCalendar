export class Time {
  constructor(public hour: number,
              public minute: number,
              public second?: number | 0) {
  }

  static parse(str: any): Time {
    if (str instanceof Time) {
      return str
    }

    if (!str) {
      console.warn(`Cannot parse ${str} value as Time`, str)
      return
    }

    const arr = str.split(':')

    if (arr.length != 2) {
      return undefined
    }

    return new Time(parseInt(arr[0].trim()), parseInt(arr[1].trim()))
  }

  toString() {
    return `${this.hour}:${this.minute.toString().padStart(2, '0')}`
  }

  toCompareValue(): number {
    return (this.hour ?? 0) * 60 + (this.minute ?? 0)
  }

  addMinutes(minutes: number): Time {
    return new Time(
      this.hour + Math.trunc((this.minute + minutes) / 60),
      (this.minute + minutes) % 60, 0)
  }

  clone() {
    return new Time(this.hour, this.minute, this.second)
  }

  differenceMinutes(secondTime: Time): number {
    return Math.abs(this.hour - secondTime.hour) * 60 + Math.abs(this.minute - secondTime.minute)
  }
}

export class TimeRange {
  private readonly _start: Time | null
  private readonly _end: Time | null

  get start(): Time | null {
    return this._start
  }

  get end(): Time | null {
    return this._end
  }

  constructor(private time1: Time | null,
              private time2: Time | null) {
    if (!time1 || !time2) {
      return null
    }

    if (time1?.toCompareValue() > time2?.toCompareValue()) {
      this._start = time2
      this._end = time1
    } else {
      this._start = time1
      this._end = time2
    }
  }

  static empty: TimeRange = new TimeRange(null, null)

  toString() {
    return `${this.start.toString()}–${this.end.toString()}`
  }
}

