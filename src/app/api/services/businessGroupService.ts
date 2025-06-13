import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessGroupService {
  constructor(private http: HttpClient) { }

  GetBusinessGroupWiseTextconfiguration(businessGroupID: any) {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT +
          'BusinessGroups/GetBusinessGroupWiseTextconfiguration/' +
          businessGroupID
      )
      .pipe(
        map((member) => {
          return member;
        })
      );
  }
}
