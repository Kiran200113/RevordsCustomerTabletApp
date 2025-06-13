import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicFieldService {
  constructor(private http: HttpClient) { }

  GetDynamicFieldsByBusinessGroupId(businessGroupID: any) {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT +
          'GroupWiseDynamicFields/GetDynamicFieldsByBusinessGroupId/' +
          businessGroupID
      )
      .pipe(
        map((member) => {
          return member;
        })
      );
  }

  GetDynamicFieldsByBusinessLocationId(BusinessLocationId: any) {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT +
          'GroupWiseDynamicFields/GetDynamicFieldsByBusinessLocationId/' +
          BusinessLocationId
      )
      .pipe(
        map((member) => {
          return member;
        })
      );
  }

  GetErrorMessageForTabletApp() {
    return this.http.get<any>(CONSTANTS.API_ENDPOINT + "DashBoard/GetErrorMessageForTabletApp")
      .pipe(map(data => {
        return data;
      }));
  }
}
