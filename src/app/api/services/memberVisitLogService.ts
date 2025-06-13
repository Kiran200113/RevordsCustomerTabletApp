import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { catchError, map, throwError, timeout } from 'rxjs';
import { MembersVistLog } from 'src/app/tab2/model';

@Injectable({
  providedIn: 'root'
})
export class MemberVisitLogService {
  ApiTimeoutPeriod: any;
  
  constructor(private http: HttpClient) { }

  PostMemberVisitLog(membersVistLog: MembersVistLog) {
    return this.http
      .post<MembersVistLog>(
        CONSTANTS.API_ENDPOINT + `MembersVistLogs`,
        membersVistLog
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  GetMemberBySignout(BusinessLocationId: any, SourceId: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}'); 

    return this.http.get(
      CONSTANTS.API_ENDPOINT +
      `MembersVistLogs/GetMemberVistLogByBusinessLocationId/${BusinessLocationId}/${SourceId}`
    ).pipe(
      timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }
        return throwError(() => error);
      })
    );
  }
}
