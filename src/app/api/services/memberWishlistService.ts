import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberWishlistService {
  constructor(private http: HttpClient) { }

  PostMemberWishlistByLike(newMemberData: any) {
    return this.http
      .post(
        CONSTANTS.API_ENDPOINT + 'MembersWishLists/PostMemberWishlistInMobile',
        newMemberData
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
}
