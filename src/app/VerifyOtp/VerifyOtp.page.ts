import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  AlertController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { Model } from '../tab2/model';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import * as CONSTANTS from '../api/services/Constants';
import { Subscription, interval } from 'rxjs';
import {
  CountdownComponent,
  CountdownConfig,
  CountdownEvent,
} from 'ngx-countdown';
import { SpinWheelService } from '../api/services/spinWheelService';
import { LoggingService } from '../api/services/loggingService';
import { dateValidator } from '../dateValidator';

@Component({
  selector: 'app-VerifyOtp',
  templateUrl: 'VerifyOtp.page.html',
  styleUrls: ['VerifyOtp.page.scss'],
})
export class VerifyOtpPage implements OnDestroy {
  prog1NewMember: any;
  display = '';
  phoneNumber: any = '';
  isLoading = false;
  dynamicField: any;
  bgImg: any = localStorage.getItem('BgImg');
  showToast: boolean = false;
  toastMsg: any = '';
  toastID: any;
  ApiTimeoutPeriod: any;
  alert: any;
  otpGroup: FormGroup;
  isResendAvailable: boolean = false;
  isAgeRestriction: boolean;
  ageRestrictionYear: number;
  isOptInPopupRequired: boolean;
  OptInPopupText: string;
  displayNumber: string;
  sentOTP: string;
  isOtpResent: boolean = false;

  @ViewChild('otp1') otp1!: ElementRef<HTMLInputElement>;
  @ViewChild('otp2') otp2!: ElementRef<HTMLInputElement>;
  @ViewChild('otp3') otp3!: ElementRef<HTMLInputElement>;
  @ViewChild('otp4') otp4!: ElementRef<HTMLInputElement>;
  otpInputs: ElementRef<HTMLInputElement>[] = [];

  constructor(
    private router: Router,
    public activatedRoute: ActivatedRoute,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    private _memberProfile: GetMemberProfileService,
    private _loggingService: LoggingService
  ) {
    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');
    this.otpGroup = this.formBuilder.group({
      otp1: [''],
      otp2: [''],
      otp3: [''],
      otp4: ['']
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['sentOTP']) {
        this.sentOTP = JSON.parse(params['sentOTP']);
      }
      if (params && params['displayNumber']) {
        this.displayNumber = JSON.parse(params['displayNumber']);
      }
      if (params && params['memberPhone']) {
        this.phoneNumber = JSON.parse(params['memberPhone']);
      }
      if (params && params['isAgeRestriction']) {
        this.isAgeRestriction = JSON.parse(params['isAgeRestriction']);
      }
      if (params && params['ageRestrictionYear']) {
        this.ageRestrictionYear = Number(JSON.parse(params['ageRestrictionYear']));
      }
      if (params && params['isOptInPopupRequired']) {
        this.isOptInPopupRequired = JSON.parse(params['isOptInPopupRequired']);
      }
      if (params && params['OptInPopupText']) {
        this.OptInPopupText = JSON.parse(params['OptInPopupText']);
      }
    });
  }
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  @ViewChild('cdResend', { static: false }) private countdowncdResend: CountdownComponent;

  configVerifyOTP: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterVerifyOtp /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };

  resendBtnConfig: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterResendBtn /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };

  initializeCountdown() {
    const counterVerifyOtp =
      JSON.parse(localStorage.getItem('DynamicField') || '{}').counterVerifyOtp || 60;

    this.configVerifyOTP = {
      leftTime: counterVerifyOtp, // Set countdown time
      formatDate: ({ date }) => `${date / 1000}`,
    };
  }

  async ionViewWillEnter() {
    this.dynamicField = JSON.parse(
      localStorage.getItem('DynamicField') || '{}'
    );

    this.initializeCountdown(); // Restart countdown when entering the page
    if (this.countdown) {
      this.countdown.restart(); // Ensure countdown starts fresh
    }

    if (Object.keys(this.dynamicField).length == 0) {
      if (this.alert != undefined && this.alert != null) {
        this.alert.dismiss();
      }
      this.router.navigate(['tab1']);
      this.showToast = true;
      this.toastMsg = this.ApiTimeoutPeriod.errorMessage;

      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  }

  ngOnInit() {
    this.initializeCountdown();
  }

  handleEvent(e: CountdownEvent) {
    if (e.left <= 0) {
      if (this.alert != undefined && this.alert != null) {
        this.alert.dismiss();
      }
      this.router.navigate(['tab1']);
    }
  }

  handleEventResendTimer(e: CountdownEvent) {
    if (e.left <= 0) {
      if (this.alert != undefined && this.alert != null) {
        this.alert.dismiss();
      }
      // this.router.navigate(['tab1']);
      this.isResendAvailable = true;
    }
  }

  back() {
    if (this.alert != undefined && this.alert != null) {
      this.alert.dismiss();
    }
    this.router.navigate(['/tab1']);
  }

  dismissToast() {
    this.showToast = false;
    clearTimeout(this.toastID);
  }

  ngOnDestroy() {
    if (this.alert) {
      this.alert.dismiss();  // Dismiss the alert if the page is destroyed
    }
  }

  verifyOtp() {
    const otp = this.otpInputs.map(input => input.nativeElement.value).join('');

    if (this.sentOTP == otp) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          memberPhone: JSON.stringify(this.phoneNumber),
          isAgeRestriction: JSON.stringify(this.isAgeRestriction),
          ageRestrictionYear: JSON.stringify(this.ageRestrictionYear),
          isOptInPopupRequired: JSON.stringify(this.isOptInPopupRequired),
          OptInPopupText: JSON.stringify(this.OptInPopupText),
        },
      };
      this.isLoading = false;
      this.router.navigate(['/NewMember'], navigationExtras);
    } else {
      this.showToast = true;
      this.toastMsg = "Please enter correct otp!";

      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  }

  ngAfterViewInit() {
    // Assign all input references to an array for easier access
    this.otpInputs = [this.otp1, this.otp2, this.otp3, this.otp4];
  }

  moveFocus(event: any, nextIndex: number) {
    const input = event.target as HTMLInputElement;

    if (!/^[0-9]$/.test(input.value)) {
      input.value = ''; // Allow only numbers
      return;
    }

    if (input.value.length === 1 && nextIndex < this.otpInputs.length) {
      const nextInput = this.otpInputs[nextIndex]?.nativeElement;

      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handleBackspace(event: KeyboardEvent, prevIndex: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && input.value === '' && prevIndex >= 0) {
      const prevInput = this.otpInputs[prevIndex]?.nativeElement;

      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  resendOtp() {
    if (!this.isOtpResent) {
      this.isOtpResent = true;

      const otp = new Uint32Array(1);
      window.crypto.getRandomValues(otp);
      let sendOTP = (otp[0] % 9000 + 1000).toString();

      this._memberProfile.PostOtpToCustomer(this.phoneNumber, sendOTP)
        .subscribe(
          (res: any) => {
            this.sentOTP = sendOTP;
            // this.isLoading = false;
            this.showToast = true;
            this.toastMsg = "OTP has been resent successfully!";
            // Hide the toast after 2 seconds
            this.toastID = setTimeout(() => {
              this.showToast = false;
            }, 5000);
          },
          async (error) => {
            this.isLoading = false;
            this.isOtpResent = false;

            this.showToast = true;
            this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
            // Hide the toast after 2 seconds
            this.toastID = setTimeout(() => {
              this.showToast = false;
            }, 5000);
            this._loggingService.PostLogger(
              'VerifyOtp-ts',
              `PostOtpToCustomer(${this.phoneNumber}, ${this.sentOTP})`,
              error.message
            );
          }
        );
    }
  }

  onOTPKeyDown(event: any) {
    if (event.key === 'Enter' || event.key === 'Go') {
      // Blur the input field to close the keyboard
      const inputElement = event.target as HTMLInputElement;
      inputElement.blur();  // This removes focus from the input field

      // Alternatively, you can set focus to a different element, e.g., a hidden div
      // Create a hidden div in the HTML to focus on, or just focus on the body:
      document.body.focus();  // Alternatively, focus on another element to hide the keyboard

      this.verifyOtp();
    }
  }

  preventCursor(event: any) {
    const input = event.target;
    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  }

  ionViewWillLeave() {
    if (this.countdown) {
      this.countdown.stop(); // Stop countdown to prevent background execution
    }
  }
}
