import {Injectable} from '@angular/core'
import {
  concatAll,
  map,
  mergeMap,
  Observable,
  of,
  toArray
} from 'rxjs'
import {DocumentReference} from '@angular/fire/compat/firestore'
import {FirestoreService} from '../../core/firestore.service'
import {Slot} from '../components/timetable/timetable-column'
import {Time, TimeRange} from '../components/timetable/model/time-model'

export interface Activity {
  id?: string,
  studentId: string,
  student?: StudentSnapshot,
  courseId: string,
  course?: Observable<CourseSnapshot>,
  price: number,
  title: string,
  datekey: number,
  timeRange: TimeRange
}

interface ActivitySnapshot {
  id?: string,
  student_id: DocumentReference | string,
  title: string,
  datekey: number,
  timeStart: string,
  timeEnd: string
}

interface StudentSnapshot {
  id: string,
  name: string
  courses: DocumentReference
}

interface CourseSnapshot {
  id?: string,
  name: string
  price: number
}

@Injectable({providedIn: 'root'})
export class ActivityClient {
  private readonly students$: Observable<StudentSnapshot[]>

  private readonly courses$: Observable<CourseSnapshot[]>

  constructor(private firestoreService: FirestoreService) {
    this.students$ = firestoreService.collectionWithIds$<StudentSnapshot>('student')
    this.courses$ = firestoreService.collection$<CourseSnapshot>('course')
  }

  load(datekeys: number[]): Observable<Activity[]> {
    const minDatekey = datekeys[0]
    const maxDatekey = datekeys[datekeys.length - 1]

    return this.firestoreService.collectionData$<ActivitySnapshot>('activity', ref => ref
      .where('datekey', '>=', minDatekey)
      .where('datekey', '<=', maxDatekey))
      .pipe(
        concatAll(),
        map(this.toActivity),
        mergeMap(activity =>
          this.getStudentById$(activity.studentId)
            .pipe(
              map(student => ({...activity, student})),
            )
        ),
        toArray(),
      )
  }

  updateOrCreateBySlot(slot: Slot) {
    const activity: ActivitySnapshot = {
      datekey: slot.position.datekey,
      timeStart: slot.timeRange.start.toString(),
      timeEnd: slot.timeRange.end.toString(),
      student_id: 'student/jkqoAdQsG3TrsFKm1k5C',
      title: slot.title ?? '',
    }

    const id = activity.id || this.firestoreService.createId()

    this.firestoreService.set<ActivitySnapshot>(`activity/${id}`, activity)
      .then(_ => {
        console.log('saved', activity)
      })
  }

  create(activity: ActivitySnapshot) {
    const id = activity.id || this.firestoreService.createId()

    this.firestoreService.set<ActivitySnapshot>(`activity/${id}`, activity)
       .then(_ => {
         console.log('saved', _)
       })
  }

  getStudentById$(studentId: string | DocumentReference): Observable<StudentSnapshot> {
    if (!studentId) {
      return of(null)
    }

    return this.firestoreService.docData$<StudentSnapshot>(studentId)
  }

  getStudents$(): Observable<StudentSnapshot[]> {
    return this.firestoreService.collectionData$<StudentSnapshot>('student')
  }

  private toActivity(snapshot: ActivitySnapshot): Activity {
    return {
      courseId: '',
      course: null,
      datekey: snapshot.datekey,
      timeRange: new TimeRange(Time.parse(snapshot.timeStart), Time.parse(snapshot.timeEnd)),
      price: 0,
      studentId: (snapshot.student_id as DocumentReference)?.path ?? snapshot.student_id as string,
      student: null,
      title: snapshot.title
    }
  }
}
