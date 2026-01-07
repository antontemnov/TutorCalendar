import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavCalendar} from '../date-navigator/nav-calendar';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [NavCalendar],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
}
