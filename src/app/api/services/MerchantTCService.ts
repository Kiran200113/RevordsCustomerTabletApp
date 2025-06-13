import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MerchantTCService {
  constructor(private http: HttpClient) {}

  GetLatestMerchantTC() {
    return this.http.get(
      CONSTANTS.API_ENDPOINT + `MerchantTC/GetLatestMerchantTC`
    );
  }

  PostMerchantTCMemberwiseDetails(data: any) {
    return this.http
      .post(
        CONSTANTS.API_ENDPOINT + 'MerchantTC/MerchantTCMemberwiseDetails',
        data
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
}
