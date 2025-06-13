import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RewardConfigService {
  constructor(private http: HttpClient) { }

  GetRewardByMemberId(BusinessGroupId: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `RewardConfigs/GetRewardForReedimtionBusinesswiseMemberwise/${BusinessGroupId}/${MemberId}`
    );
  }
}
