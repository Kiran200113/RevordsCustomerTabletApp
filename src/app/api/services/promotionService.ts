import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  constructor(private http: HttpClient) { }

  GetPromotionsByMemberId(BusinessLocationID: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `Promotions/GetPromotionsByMemberId/${BusinessLocationID}/${MemberId}`
    );
  }
}
