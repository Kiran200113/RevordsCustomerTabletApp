import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoPilotService {
  constructor(private http: HttpClient) { }

  GetAutopilotByMemberId(BusinessGroupId: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `AutoPilotConfigs/GetAutopilotByMemberId/${BusinessGroupId}/${MemberId}`
    );
  }
}
