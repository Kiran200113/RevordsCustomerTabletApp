import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessProfileService {
  constructor(private http: HttpClient) { }

  GetBusinessProfilesByID(id: any) {
    return this.http
      .get<any>(CONSTANTS.API_ENDPOINT + `BusinessProfiles/` + id)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  GetBusinessProfilesForFavorite(memberId: any, businessLocationId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `BusinessProfiles/GetBusinessProfilesForFavorite/${memberId}/${businessLocationId}`
    );
  }
}
