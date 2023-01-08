import {Pipe, PipeTransform} from '@angular/core'
import {Observable} from 'rxjs'
import {FirestoreService} from './firestore.service'

@Pipe({
  name: 'reference'
})
export class ReferencePipe implements PipeTransform {
  constructor(private firestoreService: FirestoreService) {
  }

  transform(value: any): Observable<any> {
     if (!value.path) {
       return value
     }

     return this.firestoreService.doc$(value.path)
  }
}
