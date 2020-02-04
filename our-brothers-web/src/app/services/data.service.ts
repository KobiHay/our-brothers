import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, throwError, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { User, Meeting, BereavedParticipation, UserParticipationMeeting } from '../model';

export const MEMORIAL_YEAR = 2020;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private angularFireDatabase: AngularFireDatabase) { }

  public getUserById(userId: string): Observable<User> {
    return this.angularFireDatabase
      .object<User>(`users/${userId}`)
      .valueChanges()
      .pipe(
        map(user => ({
          id: userId,
          ...user
        })),
        map(user => {

          if (user.bereavedParticipation && user.bereavedParticipation[MEMORIAL_YEAR]) {
            user.bereavedParticipation[MEMORIAL_YEAR].meetings = this.parseUserMeetings(user.bereavedParticipation[MEMORIAL_YEAR].meetings);
          }

          if (user.participateParticipation && user.participateParticipation[MEMORIAL_YEAR]) {
            user.participateParticipation[MEMORIAL_YEAR].meetings = this.parseUserMeetings(user.participateParticipation[MEMORIAL_YEAR].meetings);
          }

          return user;
        }),
        catchError(error => {
          console.log(error);
          return throwError(error);
        })
      );
  }

  public updateUserData(userId: string, data: any) {
    return from(
      this.angularFireDatabase.object<User>(`users/${userId}`).update(data)
    ).pipe(
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  public getBereaveds(): Observable<User[]> {
    return this.angularFireDatabase
      .list<User>(`users`)
      .snapshotChanges()
      .pipe(
        map(usersSnapshot =>
          usersSnapshot
            .map(usersSnapshot => ({ id: usersSnapshot.key, ...usersSnapshot.payload.val() }))
            .filter(user => user.role === 'bereaved')
            .map(user => {

              if (user.bereavedParticipation && user.bereavedParticipation[MEMORIAL_YEAR]) {
                user.bereavedParticipation[MEMORIAL_YEAR].meetings = this.parseUserMeetings(user.bereavedParticipation[MEMORIAL_YEAR].meetings);
              }

              return user;
            })
        )
      );
  }

  public getMeetings(year = MEMORIAL_YEAR): Observable<Meeting[]> {
    return this.angularFireDatabase
      .list<Meeting>(`events/${year}`)
      .snapshotChanges()
      .pipe(
        map(meetingsSnapshot => {
          const meetings: Meeting[] = [];

          for (const hostMeetingsSnapshot of meetingsSnapshot) {
            const hostId = hostMeetingsSnapshot.key;

            const hostMeetings = this.firebaseMapToArray<Meeting>(hostMeetingsSnapshot.payload.val());

            for (const meeting of hostMeetings) {
              meeting.hostId = hostId;

              meetings.push(meeting);
            }
          }

          return meetings;
        })
      );
  }

  public bereavedRegisterHost(bereaved: User, meeting: Meeting, year = MEMORIAL_YEAR): Observable<boolean> {
    const postObj = {
      id: bereaved.id,
      firstName: bereaved.profile.firstName,
      lastName: bereaved.profile.lastName,
      email: bereaved.profile.email || null,
      phoneNumber: bereaved.profile.phoneNumber,
      slain: bereaved.bereavedProfile && bereaved.bereavedProfile.slains || null
    };

    return from(this.angularFireDatabase
      .object(`events/${year}/${meeting.hostId}/${meeting.id}/bereaved`)
      .set(postObj)
      .then(() => {
        return this.angularFireDatabase.object(`users/${bereaved.id}/bereavedParticipation/${year}/meetings/${meeting.hostId}/${meeting.id}`)
          .set({
            title: meeting.title
          })
          .then(() => true);
      })
      .catch((error) => {
        console.log(error);
        throw error;
      }));
  }

  private parseUserMeetings(map: Object): UserParticipationMeeting[] {
    const participations: UserParticipationMeeting[] = [];

    Array.from(Object.entries(map))
      .forEach(([hostId, meetings]: [string, Object]) => {

        Array.from(Object.entries(meetings))
          .forEach(([id, meeting]: [string, { title: string }]) => {

            participations.push({
              id,
              hostId,
              title: meeting.title
            })

          });

      });

    return participations;
  }

  private firebaseMapToArray<T>(map: Object): T[] {
    if (map) {
      return Array.from(Object.entries(map)).map(([id, object]: [string, T]) => ({
        ...object,
        id
      }));
    }
  }
}
