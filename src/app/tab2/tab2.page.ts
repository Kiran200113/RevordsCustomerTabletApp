import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Model, ActivityHistory } from './model';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import * as CONSTANTS from '../api/services/Constants';
import { Platform, ToastController } from '@ionic/angular';
import { Subscription, catchError, interval } from 'rxjs';
import {
  CountdownComponent,
  CountdownConfig,
  CountdownEvent,
} from 'ngx-countdown';
import { ActivityHistoryService } from '../api/services/activityHistoryService';
import { SpinWheelService } from '../api/services/spinWheelService';
import { LoggingService } from '../api/services/loggingService';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnDestroy {
  number: any = Math.ceil(Math.random() * 1000);
  memberId: any;
  memberTableId: any;
  memberName: any;
  memberImage: any;
  memberSince: any;
  memberCurrentPoints: any = 0;
  badgeColor: any;
  spinning: boolean = true;
  spanclassname: any = 'arrow1';
  spanclasshover: any = 'spanHover';
  winningPrize: any = '';
  spinWheelOpts: any;
  spinWheelIndex: any;
  BusinessGroupID: any = localStorage.getItem('businessGroupId');
  BusinessLocationID: any = localStorage.getItem('businessLocationId');
  SourceID: any = localStorage.getItem('sourceId');
  display = 'none';
  prog1: any;
  prog2: any;
  showSpinCountdown: boolean = true;
  constnt: any = CONSTANTS;
  isSpin: boolean;
  ActivityHistoryID: any;
  configBefore: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterBeforeSpin /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };
  configAfter: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterAfterSpin /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };
  isTimeOut: any;
  showToast: boolean = false;
  toastMsg: any = '';
  toastID: any;
  ApiTimeoutPeriod: any;
  timeoutId: any;

  @ViewChild('wheel', { static: false }) wheel: ElementRef;
  @ViewChild('cdBefore', { static: false })
  private countdownBefore: CountdownComponent;
  @ViewChild('cdAfter', { static: false })
  private countdownAfter: CountdownComponent;

  constructor(
    public dataService: DataService,
    public activatedRoute: ActivatedRoute,
    private _memberProfile: GetMemberProfileService,
    private _loggingService: LoggingService,
    private _spinWheelService: SpinWheelService,
    private _activityHistory: ActivityHistoryService,
    private router: Router,
    private memberData: Model,
    private activity: ActivityHistory,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {
    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');

    let member: any = JSON.parse(localStorage.getItem('memberDetails') || '{}');
    this.memberId = member.memberId;
    this.memberTableId = member.memberTableID;
    this.memberName = member.name;
    this.memberImage = member.memberImg;
    this.memberSince = member.memberSince;
    this.memberCurrentPoints = member.currentPoints;
    this.badgeColor = member.badgeColor;

    this.spinWheelOpts = JSON.parse(localStorage.getItem('OPTS') || '{}');
  }

  @ViewChild('cdNewOpt', { static: false })
  private countdownNewOpt: CountdownComponent;

  ionViewWillEnter() {
    this.initializeCountdown(); // Restart countdown when entering the page
    if (this.countdownBefore) {
      this.countdownBefore.restart(); // Ensure countdown starts fresh
    }
    if (this.countdownAfter) {
      this.countdownAfter.restart(); // Ensure countdown starts fresh
    }

    this.GetSpinWheelProbabilityByMemberIDBusinessGroupID();

    let currentDate = CONSTANTS.ISODate();
    this.activity.memberId = parseInt(this.memberId);
    this.activity.activityDate = currentDate;
    this.activity.activityTypeId = 4;
    this.activity.points = 0;
    this.activity.sourceId = this.SourceID;
    this.activity.stateId = 3;
    this.activity.isActive = true;
    this.activity.createdBy = 1;
    this.activity.createdDate = currentDate;
    this.activity.lastModifiedBy = 1;
    this.activity.lastModifiedDate = currentDate;
    this.activity.promotionID = this.spinWheelOpts[0].promotionId;
    this.activity.spinWheelID = 0;
    this.activity.businessLocationId = this.BusinessLocationID;
    this.activity.spinWheelText = 'Spin Wheel Loaded...';
    this.activity.isSpinRedeem = false;

    this._activityHistory.PostActivityHistory(this.activity).subscribe(
      (data) => {
        this.ActivityHistoryID = data.id;
        this.spinning = false;
      },
      async (error) => {
        const toast = await this.toastCtrl.create({
          message: error.statusText,
          duration: 3000,
        });
        this._loggingService.PostLogger(
          'tab2-ts',
          'ionViewWillEnter()',
          error.message
        );
        // toast.present();
      }
    );

    this.isSpin = true;
    this.number = Math.ceil(Math.random() * 1000);
    this.spinning = false;
    this.spanclassname = 'arrow1';
    this.spanclasshover = 'spanHover';
    this.winningPrize = '';
    this.closePopup();
    this.wheel.nativeElement.style.transform = 'rotate(0)';

    const subscription = this.platform.backButton.subscribeWithPriority(
      99999,
      async () => { }
    );
  }

  ngOnInit() { 
    this.initializeCountdown();
  }

  initializeCountdown() {
    const counterBeforeSpin =
      JSON.parse(localStorage.getItem('DynamicField') || '{}').counterBeforeSpin || 60;

    this.configBefore = {
      leftTime: counterBeforeSpin, // Set countdown time
      formatDate: ({ date }) => `${date / 1000}`,
    };

    const counterAfterSpin =
      JSON.parse(localStorage.getItem('DynamicField') || '{}').counterAfterSpin || 60;

    this.configAfter = {
      leftTime: counterAfterSpin, // Set countdown time
      formatDate: ({ date }) => `${date / 1000}`,
    };
  }

  ionViewWillLeave() {
    if (this.countdownBefore) {
      this.countdownBefore.stop(); // Stop countdown to prevent background execution
    }
    if (this.countdownAfter) {
      this.countdownAfter.stop(); // Stop countdown to prevent background execution
    }
  }

  handleEventBefore(e: CountdownEvent) {
    if (e.left <= 0) {
      this.isTimeOut = true;
      this.spinning = true;
      this.showSpinCountdown = false;

      this.router.navigate(['tab1']); // Only navigate if the component is active


      let updatedActivityHistory = {
        id: this.ActivityHistoryID,
        spinWheelText: 'Spin Wheel Timed out!',
      };

      this._activityHistory
        .PutActivityHistoriesForSpinWheel(4, updatedActivityHistory)
        .subscribe(
          (data) => { },
          async (error) => {
            this._loggingService.PostLogger(
              'tab2-ts',
              'handleEventBefore(e: CountdownEvent)',
              error.message
            );
          }
        );
    }
  }

  handleEventAfter(e: CountdownEvent) {
    if (e.left <= 0) {
      this.isTimeOut = true;
      this.spinning = true;
      this.showSpinCountdown = false;

      this.router.navigate(['tab1']); // Only navigate if the component is active

    }
  }

  openPopup() {
    this.display = 'block';
  }
  closePopup() {
    this.display = 'none';
  }

  resetWheel() {
    this.dataService.resetToDefault();
  }

  GetSpinWheelProbabilityByMemberIDBusinessGroupID() {
    this._spinWheelService
      .GetSpinWheelProbabilityByMemberIDBusinessGroupID(
        this.memberId,
        this.BusinessGroupID,
        this.spinWheelOpts[0].promotionId
      )
      .subscribe(
        (data: any) => {
          this.spinWheelIndex = data['spinwheelindex'];
        },
        async (error) => {
          this._loggingService.PostLogger(
            'tab2-ts',
            'GetSpinWheelProbabilityByMemberIDBusinessGroupID()',
            error.message
          );
        }
      );
  }

  continue() {
    if (!this.isTimeOut) {
      if (this.spinWheelOpts[this.spinWheelIndex].isInteger == true) {
        this.showSpinCountdown = false;
        this.countdownAfter.stop();
        this.router.navigate(['/revord-summary']);
      } else {
        this.showSpinCountdown = false;
        this.countdownAfter.stop();
        this.router.navigate(['/customer-details']);
      }
    }
  }

  async Spin() {
    if (this.spinWheelIndex == undefined || this.spinWheelIndex == null) {
      return;
    }

    if (this.countdownBefore != undefined) {
      this.countdownBefore.stop();
    }
    this.showSpinCountdown = false;
    this.spinning = true;
    this.isSpin = false;
    let rotate = this.spinWheelIndex * 45;
    let rand = Math.random();
    this.number += Math.ceil(rand * 10000);
    this.wheel.nativeElement.style.transform =
      'rotate(' + (rotate + 30 * 360) + 'deg)';
    this.wheel.nativeElement.style.transition = 'all 15s';
    this.timeoutId = setTimeout(() => {
      this.spanclassname = 'arrow1 arrowanimation';
      this.spanclasshover = 'spanHover spanHoveranimation';

      for (let i = 0; i < this.spinWheelOpts.length; i++) {
        if (i == this.spinWheelIndex) {
          this.winningPrize = this.spinWheelOpts[i].arctext;

          if (this.spinWheelOpts[i].isInteger == true) {
            let p = Number(this.winningPrize.replace(' Points', ''));
            let currentDate = CONSTANTS.ISODate();
            let updatedPoints = {
              memberId: this.memberId,
              currentPoints: p,
              lastVisitDate: currentDate,
              lastModifiedDate: currentDate,
              lastModifiedBy: this.BusinessLocationID,
            };
            this._memberProfile.PutMemberProfilePoints(updatedPoints).subscribe(
              (data) => {
                localStorage.removeItem('memberDetails');
                this.memberData.memberId = this.memberId;
                this.memberData.memberTableID = this.memberTableId;
                this.memberData.name = this.memberName;
                this.memberData.memberSince = this.memberSince;
                this.memberData.memberImg = this.memberImage;
                this.memberData.currentPoints = this.memberCurrentPoints;
                this.memberData.spinWheelPoint = p;
                this.memberData.badgeColor = this.badgeColor;
                localStorage.setItem(
                  'memberDetails',
                  JSON.stringify(this.memberData)
                );

                let updatedActivityHistory = {
                  id: this.ActivityHistoryID,
                  points: p,
                  spinWheelID: this.spinWheelOpts[i].id,
                  spinWheelText: this.winningPrize,
                  isSpinRedeem: true,
                };
                this._activityHistory
                  .PutActivityHistoriesForSpinWheel(2, updatedActivityHistory)
                  .subscribe(
                    () => { },
                    async (error) => {
                      this._loggingService.PostLogger(
                        'tab2-ts',
                        'Spin()',
                        error.message
                      );
                    }
                  );
              },
              async (error) => {
                this._loggingService.PostLogger(
                  'tab2-ts',
                  'Spin()',
                  error.message
                );
                if (error.status == 0) {
                  this.showSpinCountdown = false;
                  if (this.countdownAfter != undefined) {
                    this.countdownAfter.stop();
                  }

                  this.showToast = true;
                  this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
                  // Hide the toast after 2 seconds
                  this.toastID = setTimeout(() => {
                    this.showToast = false;
                  }, 3000);
                  this.router.navigate(['/tab1']);
                }
              }
            );
          } else {
            localStorage.removeItem('memberDetails');
            this.memberData.memberId = this.memberId;
            this.memberData.memberTableID = this.memberTableId;
            this.memberData.name = this.memberName;
            this.memberData.memberSince = this.memberSince;
            this.memberData.memberImg = this.memberImage;
            this.memberData.currentPoints = this.memberCurrentPoints;
            this.memberData.spinWheelPoint = this.winningPrize;
            this.memberData.badgeColor = this.badgeColor;
            localStorage.setItem(
              'memberDetails',
              JSON.stringify(this.memberData)
            );

            let updatedActivityHistory = {
              id: this.ActivityHistoryID,
              points: 0,
              spinWheelID: this.spinWheelOpts[i].id,
              spinWheelText: this.winningPrize,
            };
            this._activityHistory
              .PutActivityHistoriesForSpinWheel(3, updatedActivityHistory)
              .subscribe(
                (data) => { },
                async (error) => {
                  this._loggingService.PostLogger(
                    'tab2-ts',
                    'Spin()',
                    error.message
                  );
                  if (error.status == 0) {
                    this.showSpinCountdown = false;
                    if (this.countdownAfter != undefined) {
                      this.countdownAfter.stop();
                    }

                    this.showToast = true;
                    this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
                    // Hide the toast after 2 seconds
                    this.toastID = setTimeout(() => {
                      this.showToast = false;
                    }, 3000);
                    this.router.navigate(['/tab1']);
                  }
                }
              );
          }
        }
      }
    }, 15300);

    setTimeout(() => {
      this.openPopup();
      this.showSpinCountdown = true;
      this.prog2 = -100;
    }, 18000);
  }

  // async Spin() {
  //   if (this.countdownBefore !== undefined) {
  //     this.countdownBefore.stop();
  //   }

  //   this.showSpinCountdown = false;
  //   this.spinning = true;
  //   this.isSpin = false;

  //   let rotate = this.spinWheelIndex * 45;
  //   let rand = Math.random();
  //   this.number += Math.ceil(rand * 10000);
  //   this.wheel.nativeElement.style.transform =
  //     'rotate(' + (rotate + 30 * 360) + 'deg)';
  //   this.wheel.nativeElement.style.transition = 'all 15s';

  //   setTimeout(() => {
  //     this.spanclassname = 'arrow1 arrowanimation';
  //     this.spanclasshover = 'spanHover spanHoveranimation';

  //     for (let i = 0; i < this.spinWheelOpts.length; i++) {
  //       if (i === this.spinWheelIndex) {
  //         this.winningPrize = this.spinWheelOpts[i].arctext;

  //         if (this.spinWheelOpts[i].isInteger) {
  //           let p = Number(this.winningPrize.replace(' Points', ''));
  //           let currentDate = CONSTANTS.ISODate();
  //           let updatedPoints = {
  //             memberId: this.memberId,
  //             currentPoints: p,
  //             lastVisitDate: currentDate,
  //             lastModifiedDate: currentDate,
  //             lastModifiedBy: this.BusinessLocationID,
  //           };

  //           this._memberProfile.PutMemberProfilePoints(updatedPoints).subscribe(
  //             () => {
  //               localStorage.removeItem('memberDetails');
  //               this.memberData.memberId = this.memberId;
  //               this.memberData.memberTableID = this.memberTableId;
  //               this.memberData.name = this.memberName;
  //               this.memberData.memberSince = this.memberSince;
  //               this.memberData.memberImg = this.memberImage;
  //               this.memberData.currentPoints = this.memberCurrentPoints;
  //               this.memberData.spinWheelPoint = p;
  //               this.memberData.badgeColor = this.badgeColor;
  //               localStorage.setItem(
  //                 'memberDetails',
  //                 JSON.stringify(this.memberData)
  //               );
  //             },
  //             async (error) => {
  //               // this.handleNetworkError(error);
  //             }
  //           );
  //         } else {
  //           // Handle non-integer spin wheel logic here
  //         }
  //       }
  //     }
  //   }, 15300);

  //   setTimeout(() => {
  //     this.openPopup();
  //     this.showSpinCountdown = true;
  //     this.prog2 = -100;
  //   }, 18000);
  // }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  dismissToast() {
    this.showToast = false;
    clearTimeout(this.toastID);
  }
}
