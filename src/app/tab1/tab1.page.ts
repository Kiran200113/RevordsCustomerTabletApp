import { Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import {
  ModalController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { MembersVistLog, Model } from '../tab2/model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as CONSTANTS from '../api/services/Constants';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { IonModal } from '@ionic/angular';
import { MemberVisitLogService } from '../api/services/memberVisitLogService';
import { BusinessProfileService } from '../api/services/businessProfileService';
import { SpinWheelService } from '../api/services/spinWheelService';
import { BusinessGroupService } from '../api/services/businessGroupService';
import { DynamicFieldService } from '../api/services/dynamicFieldService';
import { LoggingService } from '../api/services/loggingService';
import { UserService } from '../api/services/userService';
import { TOMerchantTCService } from '../api/services/TOMerchantTCService';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MerchantTCService } from '../api/services/MerchantTCService';
import { ILoggerService } from '../api/services/ilogservice';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnDestroy {
  members: any;
  response: any;
  display = '';
  phoneNumber: any = '';
  memberDataExist: any;
  memberProfileExist: any;
  memberVisitLogRes: any;
  newMemberProfileRes: any;
  isLoading = false;
  signInLog: any = [];
  _defaultOpts: {
    id: number;
    indexID: number;
    arctext: string;
    colorCode: string;
    probability: number;
    promotionId: number;
    isInteger: boolean;
    configName: string;
  }[] = [];
  // BusinessGroupID: any = localStorage.getItem('businessGroupId');
  BusinessLocationID: any = localStorage.getItem('businessLocationId');
  SourceID: any = localStorage.getItem('sourceId');
  currentVersion: any;
  @ViewChild(IonModal) modal: IonModal;
  @ViewChild('iframeRef') iframeRef!: ElementRef;

  isModalOpen = false;
  isInfoModalOpen = false;
  businessGroupLogo: any;
  toLogo: any;
  isAgeRestriction: boolean;
  ageRestrictionYear: number;
  isOptInPopupRequired: boolean;
  OptInPopupText: string;
  businessGroupName: any;
  sourceName: any;
  businessGroupId: any;
  InfoText: any;
  dynamicField: any;
  dynamicFieldLocationWise: any;
  bgImg: any;
  TOID: any;
  TCHtmlHref: any;
  LatestTCID: any;
  sanitizedUrl: SafeResourceUrl;
  isUserOpenTC: any;
  form: FormGroup;
  showToast: boolean = false;
  TCOpenFrom: number = 0;
  showToastMsg: boolean = false;
  toastMsg: any = '';
  toastID: any;
  ApiTimeoutPeriod: any;
  constructor(
    private router: Router,
    private _memberProfile: GetMemberProfileService,
    private _loggingService: LoggingService,
    private _dynamicFieldService: DynamicFieldService,
    private _businessGroupService: BusinessGroupService,
    private _businessProfile: BusinessProfileService,
    private _memberVisitLogService: MemberVisitLogService,
    private m: Model,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    private _spinWheelService: SpinWheelService,
    private platform: Platform,
    private memberVisitLog: MembersVistLog,
    private appVersionNative: AppVersion,
    private _userService: UserService,
    private _toMerchantTCService: TOMerchantTCService,
    private _merchantTCService: MerchantTCService,
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
  ) {
    this.sourceName = localStorage.getItem('sourceName');
    this.businessGroupName = localStorage.getItem('businessGroupName');
    this.businessGroupId = localStorage.getItem('businessGroupId');
    this.SourceID = localStorage.getItem('sourceId');
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');

    this.appVersionNative
      .getVersionNumber()
      .then(async (versionNumber: any) => {
        this.currentVersion = versionNumber;
      });
  }

  ionViewDidEnter() {
    const subscription = this.platform.backButton.subscribeWithPriority(
      9999,
      () => {
        // do nothing
      }
    );
  }
  async ngOnDestroy() {
    if (this.isModalOpen) {
      this.isModalOpen = false; // Reset modal state
      await this.modalController.dismiss(); // Programmatically dismiss the modal
    }
  }
  ionViewWillEnter() {
    if (!localStorage.getItem('JWT_Token')) {
      this.display = '';
      this.phoneNumber = '';
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this._loggingService.uploadOfflineLogs();
    this.sourceName = localStorage.getItem('sourceName');
    this.businessGroupName = localStorage.getItem('businessGroupName');
    this.businessGroupId = localStorage.getItem('businessGroupId');
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');
    this.BusinessLocationID = localStorage.getItem('businessLocationId');
    this.SourceID = localStorage.getItem('sourceId');
    this.form = this.formBuilder.group({
      termsAndConditions: [false, Validators.requiredTrue], // Ensure checkbox is checked
    });
    this.GetErrorMessageForTabletApp();
    this.getTextconfigurationByBusinessGroupID();
    this.GetDynamicFieldsByBusinessGroupId();
    this.GetDynamicFieldsByBusinessLocationId();
    this._businessProfile
      .GetBusinessProfilesByID(this.BusinessLocationID)
      .subscribe(
        (data: any) => {
          this.isAgeRestriction = data.isAgeRestriction;
          this.ageRestrictionYear = data.ageRestrictionYear;
          this.isOptInPopupRequired = data.isOptInPopupRequired;
          this.OptInPopupText = data.optInPopupText;
          this.businessGroupLogo = data.businessGroupLogo;
          this.TOID = data.toid;
          this.GetTCHtml(this.TOID);

          if (
            this.TOID != 0 &&
            this.TOID != null &&
            this.TOID != '' &&
            this.TOID != undefined
          ) {
            this._userService.GetTerminalOperatorDetails(this.TOID).subscribe(
              (data: any) => {
                this.toLogo = data.toLogoPath;
              },
              async (error) => {
                this._loggingService.PostLogger(
                  'tab1-ts',
                  'ionViewWillEnter()',
                  error.message
                );
              }
            );
          } else {
            this.toLogo = null;
          }
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'ionViewWillEnter()',
            error.message
          );
        }
      );
  }

  GetTCHtml(TOID: any) {
    if (TOID != 0 && TOID != null && TOID != '' && TOID != undefined) {
      this._toMerchantTCService.GetLatestTOMerchantTC().subscribe(
        (data: any) => {
          const url = data.htmlPath; // Replace with your actual dynamic URL
          this.TCHtmlHref = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.LatestTCID = data.id;
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'GetTCHtml()',
            error.message
          );
        }
      );
    } else {
      this._merchantTCService.GetLatestMerchantTC().subscribe(
        (data: any) => {
          const url = data.htmlPath; // Replace with your actual dynamic URL
          this.TCHtmlHref = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.LatestTCID = data.id;
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'GetTCHtml()',
            error.message
          );
        }
      );
    }
  }

  ngOnInit() { }

  async signUp() {
    try {
      // this._iloggerService.readJsonFile();
      if (!localStorage.getItem('JWT_Token')) {
        this.display = '';
        this.phoneNumber = '';
        localStorage.clear();
        this.router.navigate(['']);
        return;
      }
      if (!this.isModalOpen) {
        this.isLoading = true;
        localStorage.removeItem('memberDetails');
        if (
          this.phoneNumber.length == 10 &&
          !/^([0-9])\1*$/.test(this.phoneNumber) &&
          !/^[0][0-9]/.test(this.phoneNumber)
        ) {
          this._memberProfile.GetMemberExistByPhoneNo(this.phoneNumber).subscribe(
            (res: any) => {
              this.memberDataExist = res;

              this._memberProfile
                .GetMemberProfileByPhoneNo(
                  this.businessGroupId,
                  this.BusinessLocationID,
                  this.phoneNumber
                )
                .subscribe(
                  (resProfile: any) => {
                    this.memberProfileExist = resProfile;
                    this._memberVisitLogService
                      .GetMemberBySignout(this.BusinessLocationID, this.SourceID)
                      .subscribe(
                        (data: any) => {
                          this.signInLog = data;
                          let signInId: Array<number> = [];

                          this.signInLog.forEach((element: any) => {
                            signInId.push(element.memberId);
                          });

                          if (signInId.includes(this.memberProfileExist[0].id)) {
                            this.display = '';
                            this.phoneNumber = '';
                            this.isLoading = false;

                            this.showToastMsg = true;
                            this.toastMsg = "You're already signed in!";
                            // Hide the toast after 2 seconds
                            this.toastID = setTimeout(() => {
                              this.showToastMsg = false;
                            }, 5000);
                          } else {
                            if (!resProfile[0].isTCAgree) {
                              this.isLoading = false;
                              this.isModalOpen = true;
                              this.TCOpenFrom = 3;
                            } else {
                              this.ifTCAgreeWithExistMember(true);
                            }
                          }
                        },
                        async (error) => {
                          this._loggingService.PostLogger(
                            'tab1-ts',
                            'signUp()',
                            error.message
                          );
                        }
                      );
                  },
                  async (error) => {
                    this._loggingService.PostLogger(
                      'tab1-ts',
                      'signUp()',
                      error.message
                    );
                    if (error.status == 404) {
                      // this.display = '';
                      // this.phoneNumber = '';
                      this.isModalOpen = true;
                      this.TCOpenFrom = 2;
                    } else {
                      this.showToastMsg = true;
                      this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
                      // Hide the toast after 2 seconds
                      this.toastID = setTimeout(() => {
                        this.showToastMsg = false;
                      }, 5000);
                    }
                  }
                );
            },
            async (error) => {
              this._loggingService.PostLogger(
                'tab1-ts',
                'signUp()',
                error.message
              );
              if (error.status == 404) {
                this.isLoading = false;
                this.isModalOpen = true;
                this.TCOpenFrom = 1;
              } else {
                this.isLoading = false;
                this.showToastMsg = true;
                this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
                // Hide the toast after 2 seconds
                this.toastID = setTimeout(() => {
                  this.showToastMsg = false;
                }, 5000);
              }
            }
          );
        } else {
          this.isLoading = false;
          this.display = '';
          this.phoneNumber = '';

          this.showToastMsg = true;
          this.toastMsg = 'Please enter a valid phone number.';
          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToastMsg = false;
          }, 5000);
        }
      }
    } catch (error) {
      this.isLoading = false;
      this.display = '';
      this.phoneNumber = '';

      this.showToastMsg = true;
      this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToastMsg = false;
      }, 5000);
      this._loggingService.PostLogger(
        'tab1-ts',
        'signUp()',
        error
      );
    }
  }

  async ifTCAgreeWithExistMember(isTC: any) {
    this.m.name = this.memberProfileExist[0].name;
    this.m.currentPoints = this.memberProfileExist[0].currentpoints;
    this.m.memberId = this.memberProfileExist[0].id;
    this.m.memberTableID = this.memberProfileExist[0].memberId;
    this.m.memberSince = this.memberProfileExist[0].membersince;
    this.m.badgeColor = this.memberProfileExist[0].badgeColor;
    this.m.memberImg = this.memberDataExist[0].memberImageFile;
    localStorage.setItem('memberDetails', JSON.stringify(this.m));

    if (this.memberProfileExist[0].isAskOptIn == true) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          memberName: JSON.stringify(this.memberProfileExist[0].name),
          memberImage: JSON.stringify(
            this.memberProfileExist[0].memberImageFile
          ),
          memberPhone: JSON.stringify(this.phoneNumber),
          isMemberExist: JSON.stringify('true'),
          memberLifeTimeVisit: JSON.stringify(
            this.memberProfileExist[0].lifetimeVisits
          ),
          isAgeRestriction: JSON.stringify(this.isAgeRestriction),
          ageRestrictionYear: JSON.stringify(this.ageRestrictionYear),
          isOptInPopupRequired: JSON.stringify(this.isOptInPopupRequired),
          OptInPopupText: JSON.stringify(this.OptInPopupText),
          isOverAged: JSON.stringify(this.memberProfileExist[0].isOverAged),
          memberData: JSON.stringify(this.memberProfileExist[0]),
          memberBirthDate: JSON.stringify(this.memberProfileExist[0].birthDate),
          isTCAgree: isTC,
          LatestTCID: this.LatestTCID,
        },
      };
      this.display = '';
      this.phoneNumber = '';
      this.isLoading = false;
      this.TCOpenFrom = 0;
      this.router.navigate(['/NewMemberOptIn'], navigationExtras);
    } else {
      if (this.TOID != 0 &&
        this.TOID != null &&
        this.TOID != '' &&
        this.TOID != undefined) {
        this.postTOTCMember(this.memberProfileExist[0].id);
      } else {
        this.postMerchantTCMember(this.memberProfileExist[0].id);
      }

      this._spinWheelService
        .GetSpinWheelConfigByMemberIDBusinessLocationID(
          this.m.memberId,
          this.BusinessLocationID,
          1
        )
        .pipe()
        .subscribe(
          (data: any) => {
            try {
              this._defaultOpts = [];
              localStorage.removeItem('OPTS');
              data.forEach((element: any) => {
                this._defaultOpts.push({
                  id: element.id,
                  indexID: element.indexID,
                  arctext: element.arctext,
                  colorCode: element.colorCode,
                  probability: element.probability,
                  promotionId: element.promotionId,
                  isInteger: element.isInteger,
                  configName: element.configName,
                });
              });

              localStorage.setItem('OPTS', JSON.stringify(this._defaultOpts));
              let currentDate = CONSTANTS.ISODate();
              this.memberVisitLog.MemberId = this.memberProfileExist[0].id;
              this.memberVisitLog.SignIn = currentDate;
              this.memberVisitLog.SourceId = this.SourceID;
              this.memberVisitLog.BusinessLocationId = this.BusinessLocationID;
              this.memberVisitLog.StateId = 3;
              this.memberVisitLog.IsActive = true;
              this.memberVisitLog.CreatedBy = 1;
              this.memberVisitLog.CreatedDate = currentDate;
              this.memberVisitLog.LastModifiedBy = 1;
              this.memberVisitLog.LastModifiedDate = currentDate;
            } catch (error: any) {
              this._loggingService.PostLogger(
                'tab1-ts',
                'signUp()',
                error.message
              );
            }

            this._memberVisitLogService
              .PostMemberVisitLog(this.memberVisitLog)
              .subscribe(
                (data) => {
                  this.response = data;
                },
                async (error) => {
                  this._loggingService.PostLogger(
                    'tab1-ts',
                    'signUp()',
                    error.message
                  );
                }
              );

            this.TCOpenFrom = 0;
            this.router.navigate(['/tab2']);
            this.display = '';
            this.phoneNumber = '';
            this.isLoading = false;
          },
          async (error) => {
            this._loggingService.PostLogger(
              'tab1-ts',
              'signUp()',
              error.message
            );

            if (error.status == 404) {
              let currentDate = CONSTANTS.ISODate();
              this.memberVisitLog.MemberId = this.memberProfileExist[0].id;
              this.memberVisitLog.SignIn = currentDate;
              this.memberVisitLog.SourceId = this.SourceID;
              this.memberVisitLog.BusinessLocationId = this.BusinessLocationID;
              this.memberVisitLog.StateId = 3;
              this.memberVisitLog.IsActive = true;
              this.memberVisitLog.CreatedBy = 1;
              this.memberVisitLog.CreatedDate = currentDate;
              this.memberVisitLog.LastModifiedBy = 1;
              this.memberVisitLog.LastModifiedDate = currentDate;

              this._memberVisitLogService
                .PostMemberVisitLog(this.memberVisitLog)
                .subscribe(
                  (data) => {
                    this.response = data;
                    this.TCOpenFrom = 0;
                    this.router.navigate(['/customer-details']);
                    this.display = '';
                    this.phoneNumber = '';
                    this.isLoading = false;
                  },
                  async (error) => {
                    this._loggingService.PostLogger(
                      'tab1-ts',
                      'signUp()',
                      error.message
                    );
                  }
                );
            }
          }
        );
    }
  }

  async postTOTCMember(memberProfileID: any) {
    let currentDate = CONSTANTS.ISODate();
    let TCMemberwiseDetails = {
      uniqueID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 0,
      memberProfileID: memberProfileID,
      businessLocationID: this.BusinessLocationID,
      toMerchantTCID: this.LatestTCID,
      createdBy: 1,
      createdDate: currentDate,
    };

    this._toMerchantTCService
      .PostTOMerchantTCMemberwiseDetails(TCMemberwiseDetails)
      .subscribe(
        (res: any) => {
        },
        async (error) => {
          this.isLoading = false;
          this.showToast = true;
          this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        }
      );
  }

  async postMerchantTCMember(memberProfileID: any) {
    let currentDate = CONSTANTS.ISODate();
    let TCMemberwiseDetails = {
      uniqueID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 0,
      memberProfileID: memberProfileID,
      businessLocationID: this.BusinessLocationID,
      merchantTCID: this.LatestTCID,
      createdBy: 1,
      createdDate: currentDate,
    };
    this._merchantTCService
      .PostMerchantTCMemberwiseDetails(TCMemberwiseDetails)
      .subscribe(
        (res: any) => { },
        async (error) => {
          this.isLoading = false;
          this.showToast = true;
          this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        }
      );
  }

  async ifMemberProfileNotExist() {
    let currentDate = CONSTANTS.ISODate();
    let newMemberProfileData = {
      uniqueId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 0,
      memberId: this.memberDataExist[0].memberId,
      notes: null,
      badgeId: 1,
      tagId: null,
      businessGroupId: this.businessGroupId,
      lastVisitDate: currentDate,
      lifeTimePoints: 0,
      lifeTimeVisits: 0,
      emailOptIn: true,
      notificationOptIn: true,
      currentPoints: 0,
      sourceId: this.SourceID,
      stateId: 3,
      isActive: true,
      createdBy: 1,
      createdDate: currentDate,
      lastModifiedBy: 1,
      lastModifiedDate: currentDate,
      isHighroller: 0,
      businessLocationID: this.BusinessLocationID,
      baseLocationID: this.BusinessLocationID,
    };

    let navigationExtras: NavigationExtras = {
      queryParams: {
        memberName: JSON.stringify(this.memberDataExist[0].name),
        memberImage: JSON.stringify(this.memberDataExist[0].memberImageFile),
        memberPhone: JSON.stringify(this.phoneNumber),
        isMemberExist: JSON.stringify('false'),
        memberLifeTimeVisit: JSON.stringify(0),
        isAgeRestriction: JSON.stringify(this.isAgeRestriction),
        ageRestrictionYear: JSON.stringify(this.ageRestrictionYear),
        isOptInPopupRequired: JSON.stringify(this.isOptInPopupRequired),
        OptInPopupText: JSON.stringify(this.OptInPopupText),
        isOverAged: JSON.stringify('false'),
        memberData: JSON.stringify(newMemberProfileData),
        memberBirthDate: JSON.stringify(this.memberDataExist[0].birthDate),
        isTCAgree: false,
        LatestTCID: this.LatestTCID,
      },
    };
    this.isLoading = false;
    this.TCOpenFrom = 0;
    this.router.navigate(['/NewMemberOptIn'], navigationExtras);
  }

  async continue() {
    if (this.form.valid) {
      this.isLoading = true;
      this.isModalOpen = false;
      this.modalController.dismiss();
      if (!this.isModalOpen) {
        if (this.TCOpenFrom == 1) {
          const otp = new Uint32Array(1);
          window.crypto.getRandomValues(otp);
          let sendOTP = (otp[0] % 9000 + 1000).toString();

          if (this.phoneNumber == '8780886712') {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                sentOTP: JSON.stringify(sendOTP),
                displayNumber: JSON.stringify(this.display),
                memberPhone: JSON.stringify(this.phoneNumber),
                isAgeRestriction: JSON.stringify(this.isAgeRestriction),
                ageRestrictionYear: JSON.stringify(this.ageRestrictionYear),
                isOptInPopupRequired: JSON.stringify(this.isOptInPopupRequired),
                OptInPopupText: JSON.stringify(this.OptInPopupText),
              },
            };
            this.isLoading = false;
            this.router.navigate(['/VerifyOtp'], navigationExtras);
            this.display = '';
            this.phoneNumber = '';
          } else {
            this._memberProfile.PostOtpToCustomer(this.phoneNumber, sendOTP)
              .subscribe(
                (res: any) => {
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      sentOTP: JSON.stringify(sendOTP),
                      displayNumber: JSON.stringify(this.display),
                      memberPhone: JSON.stringify(this.phoneNumber),
                      isAgeRestriction: JSON.stringify(this.isAgeRestriction),
                      ageRestrictionYear: JSON.stringify(this.ageRestrictionYear),
                      isOptInPopupRequired: JSON.stringify(this.isOptInPopupRequired),
                      OptInPopupText: JSON.stringify(this.OptInPopupText),
                    },
                  };
                  this.isLoading = false;
                  this.router.navigate(['/VerifyOtp'], navigationExtras);
                  this.display = '';
                  this.phoneNumber = '';
                },
                async (error) => {
                  this.isLoading = false;
                  this.form.controls['termsAndConditions'].setValue(false);
                  if (error.status == 400) {
                    this.showToastMsg = true;
                    this.toastMsg = "Please enter valid number.";
                    // Hide the toast after 2 seconds
                    this.toastID = setTimeout(() => {
                      this.showToastMsg = false;
                    }, 5000);
                  } else {
                    this.showToastMsg = true;
                    this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
                    // Hide the toast after 2 seconds
                    this.toastID = setTimeout(() => {
                      this.showToastMsg = false;
                    }, 5000);

                    this._loggingService.PostLogger(
                      'tab1-ts',
                      `PostOtpToCustomer(${this.phoneNumber}, ${sendOTP})`,
                      error.message
                    );
                  }
                }
              );
          }
        }
        if (this.TCOpenFrom == 2) {
          this.ifMemberProfileNotExist();
          this.display = '';
          this.phoneNumber = '';
        }
        if (this.TCOpenFrom == 3) {
          this.ifTCAgreeWithExistMember(false);
          this.display = '';
          this.phoneNumber = '';
        }
      }
    } else {
      this.showToast = true;
      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  }

  setPrivacyModal(value: any) {
    this.isModalOpen = value;
    this.isUserOpenTC = value;
    if (!value) {
      this.display = '';
      this.phoneNumber = '';
    }
    this.form.reset();
  }

  setInfoModal(value: any) {
    this.isInfoModalOpen = value;
  }

  async getSpinWheelConfig(memberId: any) {
    let action = this._spinWheelService
      .GetSpinWheelConfigByMemberIDBusinessLocationID(
        memberId,
        this.BusinessLocationID,
        1
      )
      .pipe()
      .subscribe(
        (data: any) => {
          this._defaultOpts = [];
          localStorage.removeItem('OPTS');
          data.forEach((element: any) => {
            this._defaultOpts.push({
              id: element.id,
              indexID: element.indexID,
              arctext: element.arctext,
              colorCode: element.colorCode,
              probability: element.probability,
              promotionId: element.promotionId,
              isInteger: element.isInteger,
              configName: element.configName,
            });
          });

          localStorage.setItem('OPTS', JSON.stringify(this._defaultOpts));
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'getSpinWheelConfig(memberId: any)',
            error.message
          );
        }
      );
    await Promise.resolve(action);
  }

  click(val: any) {
    if (!this.isModalOpen) {
      switch (val) {
        case 'delete-left':
          if (this.phoneNumber) {
            let displayLength = this.phoneNumber.length;
            this.phoneNumber = this.phoneNumber.substring(0, displayLength - 1);

            let len = this.display.length;
            if (len == 11) {
              this.display = this.display.substring(0, this.display.length - 2);
            } else if (len == 7) {
              this.display = this.display.substring(0, this.display.length - 2);
            } else if (len == 5) {
              this.display = this.display.substring(0, this.display.length - 2);
            } else if (len == 2) {
              this.display = '';
            } else {
              this.display = this.display.substring(0, this.display.length - 1);
            }
          }
          break;
        default:
          this.addnumber(val);
          break;
      }
    }
  }

  addnumber(nbr: string) {
    let len = this.phoneNumber.length;

    if (len >= 10) {
      this.display = this.display;
      this.phoneNumber = this.phoneNumber;
    } else {
      this.phoneNumber = this.phoneNumber.toString() + nbr;

      if (len == 0) {
        this.display = '(' + nbr;
      } else if (len == 2) {
        this.display += nbr + ')';
      } else if (len == 3) {
        this.display += ' ' + nbr;
      } else if (len == 6) {
        this.display += '-' + nbr;
      } else if (len == 10) {
        this.display = this.phoneNumber;
      } else {
        this.display += nbr;
      }
    }
  }

  getTextconfigurationByBusinessGroupID() {
    //For getting checklist if no member sign in currently
    this._businessGroupService
      .GetBusinessGroupWiseTextconfiguration(this.businessGroupId)
      .subscribe(
        (data: any) => {
          this.InfoText = data;
        },
        async (error: any) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'getTextconfigurationByBusinessGroupID()',
            error.message
          );
        }
      );
  }

  GetDynamicFieldsByBusinessGroupId() {
    this._dynamicFieldService
      .GetDynamicFieldsByBusinessGroupId(this.businessGroupId)
      .subscribe(
        async (data: any) => {
          try {
            localStorage.removeItem('DynamicField');

            localStorage.setItem('DynamicField', JSON.stringify(data));
            if (
              localStorage.getItem('BgImg') == null ||
              localStorage.getItem('BgImg') == undefined ||
              localStorage.getItem('BgImg') == ''
            ) {
              localStorage.removeItem('BgImg');
              localStorage.setItem('BgImg', String(data.customerBGPath1));
            } else {
              if (
                (localStorage.getItem('BgImg') || '').toString().trim() !=
                data.customerBGPath1.toString().trim()
              ) {
                localStorage.removeItem('BgImg');
                localStorage.setItem('BgImg', String(data.customerBGPath1));
              }
            }
            this.bgImg = localStorage.getItem('BgImg');

            if (
              localStorage.getItem('BgImg1') == null ||
              localStorage.getItem('BgImg1') == undefined ||
              localStorage.getItem('BgImg1') == ''
            ) {
              localStorage.removeItem('BgImg1');
              localStorage.setItem('BgImg1', String(data.customerBGPath2));
            } else {
              if (
                (localStorage.getItem('BgImg1') || '').toString().trim() !=
                data.customerBGPath2.toString().trim()
              ) {
                localStorage.removeItem('BgImg1');
                localStorage.setItem('BgImg1', String(data.customerBGPath2));
              }
            }

            this.dynamicField = JSON.parse(
              localStorage.getItem('DynamicField') || '{}'
            );
          } catch (error: any) {
            this._loggingService.PostLogger(
              'tab1-ts',
              'GetDynamicFieldsByBusinessGroupId()',
              error.message
            );
          }
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'GetDynamicFieldsByBusinessGroupId()',
            error.message
          );
        }
      );
  }

  GetDynamicFieldsByBusinessLocationId() {
    this._dynamicFieldService
      .GetDynamicFieldsByBusinessLocationId(this.BusinessLocationID)
      .subscribe(
        async (data: any) => {
          try {
            localStorage.removeItem('DynamicFieldLocationWise');
            localStorage.setItem('DynamicFieldLocationWise', JSON.stringify(data));

            this.dynamicFieldLocationWise = JSON.parse(
              localStorage.getItem('DynamicFieldLocationWise') || '{}'
            );

          } catch (error: any) {
            this._loggingService.PostLogger(
              'tab1-ts',
              'GetDynamicFieldsByBusinessLocationId()',
              error.message
            );
          }
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab1-ts',
            'GetDynamicFieldsByBusinessLocationId()',
            error.message
          );
        }
      );
  }

  dismissToast() {
    this.showToastMsg = false;
    this.showToast = false;
    clearTimeout(this.toastID);
  }

  GetErrorMessageForTabletApp() {
    this._dynamicFieldService.GetErrorMessageForTabletApp().subscribe((data: any) => {
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
