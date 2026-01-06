import {Component} from '@angular/core'
import {HeaderComponent} from './components/header/header.component'
import {SidebarComponent} from './components/sidebar/sidebar.component'
import {Timetable} from './components/timetable/timetable'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [HeaderComponent, SidebarComponent, Timetable]
})
export class AppComponent<D> {
  constructor() { }
}
