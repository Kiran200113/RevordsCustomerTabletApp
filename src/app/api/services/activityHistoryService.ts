import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';
import { ActivityHistory } from 'src/app/tab2/model';

@Injectable({
  providedIn: 'root'
})
export class ActivityHistoryService {
  constructor(private http: HttpClient) { }

  PostActivityHistory(activityHistory: ActivityHistory) {
    return this.http
      .post<ActivityHistory>(
        CONSTANTS.API_ENDPOINT + 'ActivityHistories',
        activityHistory
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  PutActivityHistoriesForSpinWheel(type: any, data: any) {
    return this.http
      .put(
        CONSTANTS.API_ENDPOINT +
          `ActivityHistories/PutActivityHistoryForSpinWheel/${type}`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
