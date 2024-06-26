import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { MembersVistLog, ActivityHistory } from '../../tab2/model';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class GetMemberProfileService {
  postId: any;
  private dataSubject = new BehaviorSubject<any>(null);
  data$: Observable<any> = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private toastCtrl: ToastController) {}

  setData(data: any) {
    this.dataSubject.next(data);
  }

  async toastMessage(message: string, duration: number, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      cssClass: cssClass,
    });
    toast.present();
  }

  PostMemberVisitLog(membersVistLog: MembersVistLog) {
    return this.http
      .post<MembersVistLog>(
        CONSTANTS.API_ENDPOINT + `MembersVistLogs`,
        membersVistLog
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  PostActivityHistory(activityHistory: ActivityHistory) {
    return this.http
      .post<ActivityHistory>(
        CONSTANTS.API_ENDPOINT + 'ActivityHistories',
        activityHistory
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  GetBusinessProfilesByID(id: any) {
    return this.http
      .get<any>(CONSTANTS.API_ENDPOINT + `BusinessProfiles/` + id)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

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

  GetMemberExistByPhoneNo(phoneNo: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT + `MemberProfiles/GetMemberByPhoneNo/${phoneNo}`
    );
  }

  GetMemberProfileByPhoneNo(
    businessGroupId: any,
    businessLocationID: any,
    phoneNo: any
  ) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `MemberProfiles/GetMemberProfileByPhoneNo/${businessGroupId}/${businessLocationID}/${phoneNo}`
    );
  }

  PostMemberProfile(newMemberProfileData: any) {
    return this.http
      .post(CONSTANTS.API_ENDPOINT + 'MemberProfiles', newMemberProfileData)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  PutSmsOptin(id: any, smsValue: any, overAgedValue: any) {
    return this.http
      .put(
        CONSTANTS.API_ENDPOINT +
          `MemberProfiles/PutSmsOptinInCustomerScreen/${id}/${smsValue}/${overAgedValue}`,
        null
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  PostNewMemberInStore(newMemberData: any) {
    return this.http
      .post(
        CONSTANTS.API_ENDPOINT + 'MemberProfiles/PostNewMemberInStore',
        newMemberData
      )
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  GetPromotionsByMemberId(BusinessLocationID: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `Promotions/GetPromotionsByMemberId/${BusinessLocationID}/${MemberId}`
    );
  }

  GetAutopilotByMemberId(BusinessGroupId: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `AutoPilotConfigs/GetAutopilotByMemberId/${BusinessGroupId}/${MemberId}`
    );
  }

  GetRewardByMemberId(BusinessGroupId: any, MemberId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `RewardConfigs/GetRewardForReedimtionBusinesswiseMemberwise/${BusinessGroupId}/${MemberId}`
    );
  }

  PutMemberProfilePoints(data: any) {
    return this.http
      .put(
        CONSTANTS.API_ENDPOINT + `MemberProfiles/PutMemberProfilePointsInStore`,
        data
      )
      .pipe(
        map((res) => {
          return res;
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

  GetMemberBySignout(BusinessLocationId: any, SourceId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `MembersVistLogs/GetMemberVistLogByBusinessLocationId/${BusinessLocationId}/${SourceId}`
    );
  }

  Users(Email: any, Password: any) {
    return this.http
      .get<any>(CONSTANTS.API_ENDPOINT + 'Users/' + Email + '/' + Password)
      .pipe(
        map((member) => {
          return member;
        })
      );
  }

  GetBusinessProfilesForFavorite(memberId: any, businessLocationId: any) {
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
        `BusinessProfiles/GetBusinessProfilesForFavorite/${memberId}/${businessLocationId}`
    );
  }

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

  PutActivityHistoriesForSpinWheel(type: any, data: any) {
    return this.http
      .put(
        CONSTANTS.API_ENDPOINT +
          `ActivityHistories/PutActivityHistoryForSpinWheel/${type}`,
        data
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

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
}
