import { Component, OnInit } from '@angular/core';
import { User } from '../api/model';
import { Router } from '@angular/router';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import * as CONSTANTS from '../api/services/Constants';
import { UserService } from '../api/services/userService';
import { LoggingService } from '../api/services/loggingService';
import { DynamicFieldService } from '../api/services/dynamicFieldService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  Email: any;
  Password: any;
  userData: any;
  showLoginForm: boolean = false;
  isLoadingMember = false;
  showToast: boolean = false;
  toastMsg: any = '';
  toastID: any;
  ApiTimeoutPeriod: any;

  constructor(
    private user: User,
    private router: Router,
    private _loggingService: LoggingService,
    private _userService: UserService,
    private _dynamicFieldService: DynamicFieldService
  ) {
    this.GetErrorMessageForTabletApp();
  }

  ngOnInit() { }

  signUp() {
    this.showLoginForm = true;
    this.isLoadingMember = true;
    let details = {
      userName: this.Email,
      password: this.Password,
      tabletFlag: 1
    };
    this._userService.Users(details).subscribe(
      (data: any) => {
        this.userData = data;
        if (
          this.userData != '' &&
          this.userData != null &&
          this.userData != undefined
        ) {
          this.user.businessLocationId =
            this.userData.business[0].businessLocationId;
          this.user.businessGroupId = this.userData.businessGroupId;
          this.user.businessGroupName = this.userData.businessGroupName;
          this.user.businessGroupImage = this.userData.businessGroupImage;
          this.user.businessLocationLatitude =
            this.userData.businessLocationLatitude;
          this.user.businessLocationLongitude =
            this.userData.businessLocationLongitude;
          this.user.sourceId = this.userData.business[0].sourceId;
          this.user.sourceName = this.userData.business[0].sourceName;
          this.user.IsAgeRestriction =
            this.userData.business[0].isAgeRestriction;
          this.user.accessToken = this.userData.accessToken;
          this.user.toid = this.userData.toid;
        }

        localStorage.setItem(
          'businessLocationId',
          String(this.user.businessLocationId)
        );
        localStorage.setItem(
          'businessGroupId',
          String(this.user.businessGroupId)
        );
        if (this.user.toid != null) {
          localStorage.setItem('TOID', String(this.user.toid));
        } else {
          localStorage.setItem('TOID', '');
        }
        localStorage.setItem(
          'businessGroupImage',
          String(this.user.businessGroupImage)
        );
        localStorage.setItem(
          'businessLocationLatitude',
          String(this.user.businessLocationLatitude)
        );
        localStorage.setItem(
          'businessLocationLongitude',
          String(this.user.businessLocationLongitude)
        );
        localStorage.setItem('sourceId', String(this.user.sourceId));
        localStorage.setItem(
          'businessGroupName',
          String(this.user.businessGroupName)
        );
        localStorage.setItem('sourceName', String(this.user.sourceName));
        localStorage.setItem('JWT_Token', String(this.user.accessToken));

        this.isLoadingMember = false;
        this.router.navigate(['tab1']);
        this.showLoginForm = false;
      },
      async (error: any) => {
        if (error.status == 404) {
          this.showToast = true;
          this.toastMsg = 'Please enter valid credentials.';

          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        } else {
          this.showToast = true;
          this.toastMsg = this.ApiTimeoutPeriod.errorMessage;

          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        }
        this._loggingService.PostLogger('login-ts', 'signUp()', error.message);
        this.isLoadingMember = false;
        this.showLoginForm = false;
      }
    );
  }

  dismissToast() {
    this.showToast = false;
    clearTimeout(this.toastID);
  }

  GetErrorMessageForTabletApp() {
    this._dynamicFieldService.GetErrorMessageForTabletApp().subscribe((data: any) => {
      this.ApiTimeoutPeriod = data;
      localStorage.setItem("ErroMessageData", JSON.stringify(data));
    }, async (error) => {
      // this._appService.PostLogFromFrontEnd('tab2-ts', 'ngOnInit()', error.message);
      // this._appService.toastMessage(
      //   'Something went wrong, please try again or contact support.',
      //   2000,
      //   'custom-toast'
      // );
    })
  }
}
