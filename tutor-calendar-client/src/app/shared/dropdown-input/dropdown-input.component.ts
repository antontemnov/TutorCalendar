import {Component, EventEmitter, forwardRef, Input, Output, Provider} from '@angular/core'
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms'
import {TimetableUserEvent} from '../../components/timetable/timetable'
import {Converter} from '../converters'

@Component({
    selector: 'app-dropdown-input',
    templateUrl: './dropdown-input.component.html',
    styleUrls: ['./dropdown-input.component.scss'],
    standalone: false
})
export class DropdownInputComponent<T> implements ControlValueAccessor {
  @Input() options: T[]

  @Input() converter: Converter<T> | null

  @Input() isOpened: boolean

  @Output() isOpenedChange = new EventEmitter<boolean>()

  @Output() readonly valueChanged = new EventEmitter<TimetableUserEvent<T>>()

  @Output() readonly inputValue = new EventEmitter<TimetableUserEvent<string>>()

  @Input() value: T

  constructor() {
  }

  setValue(event) {
    // this.close()
    const selectedValue = (event.target as HTMLElement).getAttribute('data-value')

    if (!selectedValue) {
      this.close()
      return
    }

    if (!this.converter) {
    }

    const convertedValue = this.converter(selectedValue)

    this.writeValue(convertedValue.toString())
    this.onChange(convertedValue.toString())

    this.close()

    this.valueChanged.emit({
      args: convertedValue,
    })
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(value: any): void {
    this.value = value
  }

  private onChange = (value: any) => {
    this.value = value
  }

  open() {
    this.isOpenedChange.emit(true)
    // this.isOpened = true
  }

  close() {
    this.isOpenedChange.emit(false)
  }

  onInputValueChange(value: string) {
    const convertedValue = this.converter(value)
    if (convertedValue) {
      this.valueChanged.emit({
        args: convertedValue,
      })

      return
    }

    this.inputValue.emit({
      args: value
    })
  }
}
