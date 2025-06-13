import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as CONSTANTS from '../api/services/Constants';
import {
  CountdownComponent,
  CountdownConfig,
  CountdownEvent,
} from 'ngx-countdown';
import { PromotionService } from '../api/services/promotionService';
import { AutoPilotService } from '../api/services/autoPilotService';
import { RewardConfigService } from '../api/services/rewardConfigService';
import { BusinessProfileService } from '../api/services/businessProfileService';
import { LoggingService } from '../api/services/loggingService';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.page.html',
  styleUrls: ['./customer-details.page.scss'],
})
export class CustomerDetailsPage implements OnInit {
  promotionData: any;
  autopilotData: any;
  rewardData: any = [];
  showPromotionData: boolean = false;
  showAutopilotData: boolean = false;
  showRewardData: boolean = false;
  memberId: any;
  memberTableId: any;
  memberName: any;
  memberSince: any;
  memberCurrentPoints: any = 0;
  badgeColor: any;
  value1: any;
  countDown1: any;
  myInterval1: any;
  isLoading: boolean = false;
  isSpinWheelInteger: boolean = false;
  spinWheelText: any = '';
  BusinessGroupID: any = localStorage.getItem('businessGroupId');
  BusinessLocationID: any = localStorage.getItem('businessLocationId');
  SourceID: any = localStorage.getItem('sourceId');
  memberImage: any;
  constnt: any = CONSTANTS;
  configDetails: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterCustomerDetails /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };
  bgImgPath2: any = localStorage.getItem('BgImg1');
  isTimeOut: any;
  isFavoriteListExist: any = false;

  constructor(
    private _loggingService: LoggingService,
    private _rewardConfig: RewardConfigService,
    private _autoPilotService: AutoPilotService,
    private _promotionService: PromotionService,
    private _businessProfile: BusinessProfileService,
    private router: Router
  ) {
    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
  }

  @ViewChild('cdDetails', { static: false })
  private countdownDetails: CountdownComponent;

  handleEventDetails(e: CountdownEvent) {
    if (e.left <= 0) {
      this.isTimeOut = true;
      this.router.navigate(['tab1']);
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.value1 = 30000;
    this.countDown1 = 30;
    let member: any = JSON.parse(localStorage.getItem('memberDetails') || '{}');
    this.memberId = member.memberId;
    this.memberTableId = member.memberTableID;
    this.memberName = member.name;
    this.memberSince = member.memberSince;
    this.memberImage = member.memberImg;
    this.memberCurrentPoints =
      typeof member.spinWheelPoint == 'number'
        ? member.currentPoints + member.spinWheelPoint
        : member.currentPoints;
    this.badgeColor = member.badgeColor;

    if (typeof member.spinWheelPoint == 'number') {
      this.isSpinWheelInteger = true;
    } else if (
      member.spinWheelPoint != 'undefined' &&
      member.spinWheelPoint != null &&
      member.spinWheelPoint != ''
    ) {
      this.isSpinWheelInteger = false;
      this.spinWheelText = 'Hooray! You have won ' + member.spinWheelPoint;
    } else {
      this.isSpinWheelInteger = true;
    }

    this.GetBusinessProfilesForFavorite();
    this.GetPromotionsList();
    this.GetAutopilotList();
    this.GetRewardList();

    this.isLoading = false;
  }

  ngOnInit() {}

  async GetPromotionsList() {
    await this._promotionService
      .GetPromotionsByMemberId(this.BusinessLocationID, this.memberId)
      .subscribe(
        (data: any) => {
          this.promotionData = data;
          if (this.promotionData.length > 0) {
            this.showPromotionData = true;
            this.promotionData.forEach((element: any) => {
              element.stateChecked = false;
            });
          } else {
            this.showPromotionData = false;
          }
        },
        async (error) => {      
          this._loggingService.PostLogger('customer-details-ts', 'GetPromotionsList()', error.message);
          this.showPromotionData = false;
        }
      );
  }

  async GetAutopilotList() {
    await this._autoPilotService
      .GetAutopilotByMemberId(this.BusinessGroupID, this.memberId)
      .subscribe(
        (data: any) => {
          this.autopilotData = data;
          if (this.autopilotData.length > 0) {
            this.showAutopilotData = true;
          } else {
            this.showAutopilotData = false;
          }
        },
        async (error) => {          
          this._loggingService.PostLogger('customer-details-ts', 'GetAutopilotList()', error.message);
          this.showAutopilotData = false;
        }
      );
  }

  async GetRewardList() {
    await this._rewardConfig
      .GetRewardByMemberId(this.BusinessGroupID, this.memberId)
      .subscribe(
        (data: any) => {
          this.rewardData = data;
          if (this.rewardData) {
            this.showRewardData = true;
          }
        },
        async (error) => {        
          this._loggingService.PostLogger('customer-details-ts', 'GetRewardList()', error.message);
          if (error.status == 404) {
            this.showRewardData = false;
          } else {
            this.showRewardData = false;
          }
        }
      );
  }

  submit() {
    if (!this.isTimeOut) {
      this.isLoading = false;
      this.countdownDetails.stop();
      if (this.isFavoriteListExist) {
        this.router.navigate(['/Favorites']);
      } else {
        this.router.navigate(['/tab1']);
      }
    }
  }

  async GetBusinessProfilesForFavorite() {
    await this._businessProfile
      .GetBusinessProfilesForFavorite(
        this.memberTableId,
        this.BusinessLocationID
      )
      .subscribe(
        (data: any) => {
          if (data.length == 0) {
            this.isFavoriteListExist = false;
          } else {
            this.isFavoriteListExist = true;
          }
        },
        async (error) => {   
          this._loggingService.PostLogger('customer-details-ts', 'GetBusinessProfilesForFavorite()', error.message);
        }
      );
  }
}
