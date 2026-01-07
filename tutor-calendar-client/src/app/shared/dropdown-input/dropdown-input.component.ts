import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {ControlValueAccessor, FormsModule} from '@angular/forms';
import {TitleCasePipe} from '@angular/common';
import {TimetableUserEvent} from '../../components/timetable/timetable';
import {Converter} from '../converters';

@Component({
    selector: 'app-dropdown-input',
    templateUrl: './dropdown-input.component.html',
    styleUrls: ['./dropdown-input.component.scss'],
    standalone: true,
    imports: [TitleCasePipe, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownInputComponent<T> implements ControlValueAccessor {
  options = input.required<T[]>();

  converter = input<Converter<T> | null>(null);

  isOpened = input<boolean>(false);

  isOpenedChange = output<boolean>();

  readonly valueChanged = output<TimetableUserEvent<T>>();

  readonly inputValue = output<TimetableUserEvent<string>>();

  // Internal value for ControlValueAccessor
  protected _internalValue: T;

  // Public value as input signal for template binding
  value = input<T>();

  constructor() {
  }

  setValue(event) {
    // this.close()
    const selectedValue = (event.target as HTMLElement).getAttribute('data-value');

    if (!selectedValue) {
      this.close();
      return;
    }

    if (!this.converter()) {
    }

    const convertedValue = this.converter()(selectedValue);

    this.writeValue(convertedValue.toString());
    this.onChange(convertedValue.toString());

    this.close();

    this.valueChanged.emit({
      args: convertedValue,
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(value: any): void {
    this._internalValue = value;
  }

  private onChange = (value: any) => {
    this._internalValue = value;
  };

  open() {
    this.isOpenedChange.emit(true);
    // this.isOpened = true
  }

  close() {
    this.isOpenedChange.emit(false);
  }

  onInputValueChange(value: string) {
    const convertedValue = this.converter()(value);
    if (convertedValue) {
      this.valueChanged.emit({
        args: convertedValue,
      });

      return;
    }

    this.inputValue.emit({
      args: value
    });
  }
}
