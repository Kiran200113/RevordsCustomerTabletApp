import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as CONSTANTS from '../api/services/Constants';
import {
  CountdownComponent,
  CountdownConfig,
  CountdownEvent,
} from 'ngx-countdown';

@Component({
  selector: 'app-revord-summary',
  templateUrl: './revord-summary.page.html',
  styleUrls: ['./revord-summary.page.scss'],
})
export class RevordSummaryPage implements OnInit {
  memberId: any;
  memberTableId: any;
  memberName: any;
  memberImage: any;
  memberSince: any;
  memberCurrentPoints: any = 0;
  badgeColor: any;
  CurrentPointsDisplay: any;
  EarnedPoints: any = 0;
  NewTotal: any = 0;
  isLoading: boolean = false;
  valuerevordSummary: any = 0;
  countDownRevordSummary: any = 0;
  myIntervalrevordsummary: any;
  constnt: any = CONSTANTS;
  bgImgPath2: any = localStorage.getItem('BgImg1');
  isTimeOut: any;

  constructor(private router: Router) {
    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
  }
  @ViewChild('cdRevordSummary', { static: false })
  private countdownRevordSummary: CountdownComponent;

  configRevordSummary: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterRevordSummary /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };

  handleEventRevordSummary(e: CountdownEvent) {
    if (e.left <= 0) {
      this.isTimeOut = true;
      this.router.navigate(['tab1']);
    }
  }

  ionViewWillEnter() {
    this.valuerevordSummary = 30000;
    this.countDownRevordSummary = 30;
    let member: any = JSON.parse(localStorage.getItem('memberDetails') || '{}');
    this.memberId = member.memberId;
    this.memberTableId = member.memberTableID;
    this.memberName = member.name;
    this.memberImage = member.memberImg;
    this.memberSince = member.memberSince;
    this.memberCurrentPoints =
      typeof member.spinWheelPoint == 'number'
        ? member.currentPoints + member.spinWheelPoint
        : member.currentPoints;
    this.badgeColor = member.badgeColor;

    this.CurrentPointsDisplay = member.currentPoints;
    this.EarnedPoints = member.spinWheelPoint;
    this.NewTotal = this.CurrentPointsDisplay + this.EarnedPoints;
    // setTimeout(() => {
    this.isLoading = false;
    //   this.myIntervalrevordsummary = setInterval(() => {
    //     this.counterRevordSummary();
    //   }, 1000);
    // }, 200)
  }

  ngOnInit() {}

  continue() {
    // clearInterval(this.myIntervalrevordsummary);
    if (!this.isTimeOut) {
      this.countdownRevordSummary.stop();
      this.router.navigate(['/customer-details']);
    }
  }
}
