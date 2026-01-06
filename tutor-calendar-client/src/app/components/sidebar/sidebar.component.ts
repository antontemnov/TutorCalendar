import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core'
import {DateSelectionService} from '../../services/date-selection-service'
import {DateAdapter} from '../../../core/date-adapter'

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: false
})
export class SidebarComponent<D> implements OnInit, OnChanges {
  constructor(
    private dateSelectionService: DateSelectionService<D>,
    private _dateAdapter: DateAdapter<D>) {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
  }
}
