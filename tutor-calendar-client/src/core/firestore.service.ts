import {Injectable} from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentData
} from '@angular/fire/compat/firestore'
import {map, Observable} from 'rxjs'
import {DocumentReference} from '@angular/fire/compat/firestore'
import { serverTimestamp } from 'firebase/firestore'

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>
type DocPredicate<T> = string | AngularFirestoreDocument<T> | DocumentReference<DocumentData>

@Injectable()
export class FirestoreService {
  constructor(private afs: AngularFirestore) {
  }

  collectionRef<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref
  }

  private docRef<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    if (typeof ref === 'string') {
      return this.afs.doc<T>(ref)
    }

    const documentReference = ref as DocumentReference<any>
    if (documentReference) {
      return this.afs.doc<T>(documentReference)
    }

    return ref as AngularFirestoreDocument<T>
  }

  get timestamp() {
    return serverTimestamp()
  }

  createId() {
    return this.afs.createId()
  }

  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.docRef(ref).snapshotChanges().pipe(
      map(doc => doc.payload.data() as T)
    )
  }

  docData$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.docRef(ref).get().pipe(
      map(doc => doc.data() as T)
    )
  }

  collection$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.collectionRef(ref, queryFn).snapshotChanges().pipe(
      map(docs => docs.map(d => d.payload.doc.data()) as T[])
    )
  }

  collectionWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.collectionRef(ref, queryFn).snapshotChanges().pipe(
      map(docs => docs.map(d => {
          const data = d.payload.doc.data()
          const id = d.payload.doc.id
        console.log({id, ...data} as T)
          return {id, ...data} as T
        })
      ))
  }

  collectionData$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.collectionRef(ref, queryFn).get().pipe(
      map(snapshot => snapshot.docs.map(d => d.data()) as T[])
    )
  }

  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp
    return this.docRef(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }
}
