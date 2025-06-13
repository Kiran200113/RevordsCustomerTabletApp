import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinWheelService {
  constructor(private http: HttpClient) { }

  GetSpinWheelConfigByMemberIDBusinessLocationID(
    memberID: any,
    businessLocationID: any,
    tabletFlag: any
  ) {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT +
          `SpinWheelDefaultConfigurationHeaders/GetSpinWheelConfigByMemberIDBusinessLocationID/${memberID}/${businessLocationID}/${tabletFlag}`
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  GetSpinWheelProbabilityByMemberIDBusinessGroupID(
    MemberId: any,
    BusinessGroupId: any,
    promotionID: any
  ) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `SpinWheelDefaultConfigurationHeaders/GetSpinWheelProbabilityByMemberIDBusinessGroupID/${MemberId}/${BusinessGroupId}/${promotionID}`
    );
  }
}
