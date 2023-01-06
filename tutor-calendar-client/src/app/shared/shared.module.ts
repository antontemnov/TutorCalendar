import {NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {DropdownInputComponent} from './dropdown-input/dropdown-input.component'
import {FormsModule} from '@angular/forms'
import {MomentPipe} from './moment.pipe'

@NgModule({
  declarations: [
    DropdownInputComponent,
    MomentPipe,
  ],
  imports: [CommonModule, FormsModule],
  exports: [CommonModule, DropdownInputComponent, MomentPipe]
})
export class SharedModule { }
