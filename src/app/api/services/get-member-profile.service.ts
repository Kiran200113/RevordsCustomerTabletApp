import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { MembersVistLog, ActivityHistory } from '../../tab2/model';
import { catchError, map, timeout } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GetMemberProfileService {
  postId: any;
  ApiTimeoutPeriod: any;

  private dataSubject = new BehaviorSubject<any>(null);
  data$: Observable<any> = this.dataSubject.asObservable();

  constructor(private http: HttpClient, private toastCtrl: ToastController, private router: Router) { }

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

  GetMemberExistByPhoneNo(phoneNo: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");
    return this.http.get(
      CONSTANTS.API_ENDPOINT + `MemberProfiles/GetMemberByPhoneNo/${phoneNo}`
    ).pipe(
      timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }
        return throwError(() => error);
      })
    );
  }

  GetMemberProfileByPhoneNo(
    businessGroupId: any,
    businessLocationID: any,
    phoneNo: any
  ) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");
    return this.http.get(
      CONSTANTS.API_ENDPOINT +
      `MemberProfiles/GetMemberProfileByPhoneNo/${businessGroupId}/${businessLocationID}/${phoneNo}`
    ).pipe(
      timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }
        return throwError(() => error);
      })
    );
  }

  PostMemberProfile(newMemberProfileData: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");

    return this.http
      .post(CONSTANTS.API_ENDPOINT + 'MemberProfiles', newMemberProfileData)
      .pipe(
        timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
        map((data) => {
          return data;
        }),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            this.router.navigate(['/tab1']); // Navigate to the home page
          }
          return throwError(() => error); // Return a fallback value
        })
      );
  }

  PutSmsOptin(id: any, smsValue: any, overAgedValue: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");

    return this.http
      .put(
        CONSTANTS.API_ENDPOINT +
        `MemberProfiles/PutSmsOptinInCustomerScreen/${id}/${smsValue}/${overAgedValue}`,
        null
      )
      .pipe(
        timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
        map((res) => {
          return res;
        }),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            this.router.navigate(['/tab1']); // Navigate to the home page
          }
          return throwError(() => error); // Return a fallback value
        })
      );
  }

  PostNewMemberInStore(newMemberData: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");

    return this.http
      .post(
        CONSTANTS.API_ENDPOINT + 'MemberProfiles/PostNewMemberInStore',
        newMemberData
      )
      .pipe(
        timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
        map((data) => {
          return data;
        }),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            this.router.navigate(['/tab1']); // Navigate to the home page
          }
          return throwError(() => error); // Return a fallback value
        })
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

  PutMemberBirthDate(memberID: any, date: any) {
    return this.http
      .put(
        CONSTANTS.API_ENDPOINT +
        `MemberProfiles/PutMemberBirthDate/${memberID}/${date}`,
        null
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  PostOtpToCustomer(phoneNumber: any, otp: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || "");

    return this.http
      .post(
        `${CONSTANTS.API_ENDPOINT}Mail/SendOTP/${phoneNumber}/${otp}`,
        null
      )
      .pipe(
        timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
        map((data) => {
          return data;
        }),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            this.router.navigate(['/tab1']); // Navigate to the home page
          }
          return throwError(() => error); // Return a fallback value
        })
      );
  }

}
