import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TOMerchantTCService {
  constructor(private http: HttpClient) {}

  GetLatestTOMerchantTC() {
    return this.http.get(
      CONSTANTS.API_ENDPOINT + `TOMerchantTC/GetLatestTOMerchantTC`
    );
  }

  PostTOMerchantTCMemberwiseDetails(data: any) {
    return this.http
      .post(
        CONSTANTS.API_ENDPOINT + 'TOMerchantTC/TOMerchantTCMemberwiseDetails',
        data
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
}
