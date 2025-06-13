import { Component, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  NavController
} from '@ionic/angular';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { MembersVistLog, Model } from '../tab2/model';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import * as CONSTANTS from '../api/services/Constants';
import {
  CountdownComponent,
  CountdownConfig,
  CountdownEvent,
} from 'ngx-countdown';
import { MemberVisitLogService } from '../api/services/memberVisitLogService';
import { SpinWheelService } from '../api/services/spinWheelService';
import { LoggingService } from '../api/services/loggingService';
import { TOMerchantTCService } from '../api/services/TOMerchantTCService';
import { MerchantTCService } from '../api/services/MerchantTCService';

@Component({
  selector: 'app-NewMemberOptIn',
  templateUrl: 'NewMemberOptIn.page.html',
  styleUrls: ['NewMemberOptIn.page.scss'],
})
export class NewMemberOptInPage implements OnDestroy {
  prog1NewMemberOptIn: any;
  members: any;
  response: any;
  display = '';
  phoneNumber: any = '';
  memberDataExist: any;
  memberProfileExist: any;
  memberVisitLogRes: any;
  newMemberProfileRes: any;
  isLoading = false;
  isMemberExist: any;
  isOverAged: any;
  memberLifeTimeVisit: any;
  signInLog: any = [];
  monthlist: any = [
    { name: 'Month', id: 0 },
    { name: 'January', id: '01' },
    { name: 'February', id: '02' },
    { name: 'March', id: '03' },
    { name: 'April', id: '04' },
    { name: 'May', id: '05' },
    { name: 'June', id: '06' },
    { name: 'July', id: '07' },
    { name: 'August', id: '08' },
    { name: 'September', id: '09' },
    { name: 'October', id: '10' },
    { name: 'November ', id: '11' },
    { name: 'December ', id: '12' },
  ];
  dayList: any = [
    { name: 'Day', id: 0 },
    { name: '1', id: '01' },
    { name: '2', id: '02' },
    { name: '3', id: '03' },
    { name: '4', id: '04' },
    { name: '5', id: '05' },
    { name: '6', id: '06' },
    { name: '7', id: '07' },
    { name: '8', id: '08' },
    { name: '9', id: '09' },
    { name: '10', id: '10' },
    { name: '11 ', id: '11' },
    { name: '12 ', id: '12' },
    { name: '13', id: '13' },
    { name: '14', id: '14' },
    { name: '15', id: '15' },
    { name: '16', id: '16' },
    { name: '17', id: '17' },
    { name: '18', id: '18' },
    { name: '19', id: '19' },
    { name: '20', id: '20' },
    { name: '21', id: '21' },
    { name: '22', id: '22' },
    { name: '23', id: '23' },
    { name: '24', id: '24' },
    { name: '25', id: '25' },
    { name: '26', id: '26' },
    { name: '27', id: '27' },
    { name: '28', id: '28' },
    { name: '29', id: '29' },
    { name: '30', id: '30' },
    { name: '31', id: '31' },
  ];
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
  displayPopup = 'none';
  multistep = new FormGroup({
    addMemberDetails: new FormGroup({
      optIn: new FormControl('', Validators.required),
      isOverAged: new FormControl(false),
      birthdate: new FormControl('', [
        Validators.pattern(
          /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/(19|20)[0-9]{2}$/
        ),
      ]),
    }),
  });
  newMemberProfileData: any;
  newMemberName: any;
  memberImage: any;
  BusinessGroupID: any = localStorage.getItem('businessGroupId');
  BusinessLocationID: any = localStorage.getItem('businessLocationId');
  SourceID: any = localStorage.getItem('sourceId');
  businessGroupName: any = localStorage.getItem('businessGroupName');
  isAgeRestriction: boolean;
  isOptInPopupRequired: boolean;
  OptInPopupText: string;
  dynamicField: any;
  bgImg: any = localStorage.getItem('BgImg');
  alert: any;
  isTCAgree: any;
  LatestTCID: any;
  TOID: any;
  showToast: boolean = false;
  toastMsg: any = '';
  newMemberBirthDate: any;
  toastID: any;
  ageRestrictionYear: number;
  ApiTimeoutPeriod: any;
  configNewOpt: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .conuterNewOptIn /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };
  @ViewChild('cdNewOpt', { static: false }) private countdownNewOpt: CountdownComponent;

  constructor(
    private router: Router,
    private _memberProfile: GetMemberProfileService,
    private _loggingService: LoggingService,
    private _memberVisitLogService: MemberVisitLogService,
    private m: Model,
    public activatedRoute: ActivatedRoute,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    private memberVistLog: MembersVistLog,
    private _spinWheelService: SpinWheelService,
    private alertCtrl: AlertController,
    private _toMerchantTCService: TOMerchantTCService,
    private _merchantTCService: MerchantTCService
  ) {
    this.TOID = localStorage.getItem('TOID');

    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['memberPhone']) {
        this.phoneNumber = JSON.parse(params['memberPhone']);
      }
      if (params && params['isAgeRestriction']) {
        this.isAgeRestriction = JSON.parse(params['isAgeRestriction']);
        // this.isAgeRestriction = true;
      }
      if (this.isAgeRestriction == true) {
        this.AddMemberDetails.birthdate?.setValidators([Validators.required]);
      } else {
        this.AddMemberDetails.birthdate?.clearValidators(); // Remove validators if not required
      }

      if (params && params['ageRestrictionYear']) {
        this.ageRestrictionYear = Number(JSON.parse(params['ageRestrictionYear']));
      }

      if (params && params['memberData']) {
        this.newMemberProfileData = JSON.parse(params['memberData']);
      }

      if (params && params['memberBirthDate']) {
        this.newMemberBirthDate = JSON.parse(params['memberBirthDate']);
        if (
          this.newMemberBirthDate != null &&
          this.newMemberBirthDate != undefined &&
          this.newMemberBirthDate != ''
        ) {
          let dt =
            new Date(this.newMemberBirthDate).getDate() < 10
              ? '0' + new Date(this.newMemberBirthDate).getDate()
              : new Date(this.newMemberBirthDate).getDate();
          let month =
            new Date(this.newMemberBirthDate).getMonth() + 1 < 10
              ? '0' + (new Date(this.newMemberBirthDate).getMonth() + 1)
              : new Date(this.newMemberBirthDate).getMonth() + 1;
          let year = new Date(this.newMemberBirthDate).getFullYear();
          let bDate = month + '/' + dt + '/' + year;
          this.AddMemberDetails.birthdate.setValue(bDate);
          this.AddMemberDetails.birthdate.disable();
        }
      }

      if (params && params['memberName']) {
        this.newMemberName = JSON.parse(params['memberName']);
      }
      if (params && params['memberImage']) {
        this.memberImage = JSON.parse(params['memberImage']);
      }
      if (params && params['isMemberExist']) {
        this.isMemberExist = JSON.parse(params['isMemberExist']);
      }
      if (params && params['isOverAged']) {
        this.isOverAged = JSON.parse(params['isOverAged']);
        this.multistep.controls['addMemberDetails'].controls[
          'isOverAged'
        ].setValue(this.isOverAged);
        if (this.isOverAged == true) {
          this.multistep.controls['addMemberDetails'].controls[
            'isOverAged'
          ].disable();
        }
      }
      if (params && params['memberLifeTimeVisit']) {
        this.memberLifeTimeVisit = JSON.parse(params['memberLifeTimeVisit']);
      }
      if (params && params['isOptInPopupRequired']) {
        this.isOptInPopupRequired = JSON.parse(params['isOptInPopupRequired']);
      }

      if (params && params['OptInPopupText']) {
        this.OptInPopupText = JSON.parse(params['OptInPopupText']);
      }

      if (params && params['isTCAgree']) {
        this.isTCAgree = JSON.parse(params['isTCAgree']);
      }

      if (params && params['LatestTCID']) {
        this.LatestTCID = JSON.parse(params['LatestTCID']);
      }
    });
  }

  async ionViewWillEnter() {
    this.dynamicField = JSON.parse(
      localStorage.getItem('DynamicField') || '{}'
    );

    this.initializeCountdown(); // Restart countdown when entering the page
    if (this.countdownNewOpt) {
      this.countdownNewOpt.restart(); // Ensure countdown starts fresh
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

  handleEventNewOpt(e: CountdownEvent) {
    if (e.left <= 0) {
      if (this.alert != undefined && this.alert != null) {
        this.alert.dismiss();
      }
      this.router.navigate(['tab1']);
    }
  }

  onInputBlur() {
    if (
      this.AddMemberDetails.birthdate.value != '' &&
      this.AddMemberDetails.birthdate.value != null &&
      this.AddMemberDetails.birthdate.value != undefined
    ) {
      const birthdateControl = this.AddMemberDetails.birthdate;
      const error = this.validateDate(birthdateControl?.value);

      if (error) {
        birthdateControl?.setErrors(error); // Set the error on the control
      } else {
        birthdateControl?.setErrors(null); // Clear errors if the input is valid
      }
    }
  }

  validateDate(birthdate: string | null): { [key: string]: boolean } | null {
    if (!birthdate) {
      return { required: true }; // Required error
    }

    const [month, day, year] = birthdate.split('/');

    // Construct a date object from the input
    // const enteredDate = new Date(`${year}-${month}-${day}`);
    const enteredDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

    // Check if the date is valid
    if (
      enteredDate.getDate() !== parseInt(day, 10) ||
      enteredDate.getMonth() + 1 !== parseInt(month, 10) ||
      enteredDate.getFullYear() !== parseInt(year, 10)
    ) {
      return { invalidDate: true }; // Invalid date format
    }

    // Get the current date and compare it with the entered date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight
    enteredDate.setHours(0, 0, 0, 0); // Normalize entered date to midnight

    if (enteredDate > currentDate) {
      return { futureDate: true }; // Date is in the future
    }

    // Calculate the difference in years
    const age = currentDate.getFullYear() - enteredDate.getFullYear();
    const monthDiff = currentDate.getMonth() - enteredDate.getMonth();
    const dayDiff = currentDate.getDate() - enteredDate.getDate();

    // Check if the age is less than 21
    if (
      age < this.ageRestrictionYear ||
      (age === this.ageRestrictionYear && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
    ) {
      return { underage: true }; // Less than this.ageRestrictionYear years
    }

    if (enteredDate.getFullYear().toString().length < 4) {
      return { invalidDate: true };
    }

    return null; // Valid date
  }

  onKeyDown(event: any) {
    const control = this.AddMemberDetails.birthdate;

    if (event.key === 'Enter' || event.key === 'Go') {
      // Blur the input field to close the keyboard
      const inputElement = event.target as HTMLInputElement;
      inputElement.blur();  // This removes focus from the input field

      // Alternatively, you can set focus to a different element, e.g., a hidden div
      // Create a hidden div in the HTML to focus on, or just focus on the body:
      document.body.focus();  // Alternatively, focus on another element to hide the keyboard
    }

    if (control && control.value !== undefined && control.value !== null) {
      const input = control.value;
      let formattedInput = input.replace(/[^0-9/]/g, '');

      // Store the cursor position
      const cursorPos = event.target['selectionStart'];

      // Check for backspace key (keyCode is 8)
      const isBackspace = event.keyCode === 8;

      // Prevent deleting characters in the middle (before slashes)
      if (
        (cursorPos <= 2 && formattedInput.length >= 3) ||
        (cursorPos > 2 && cursorPos <= 5 && formattedInput.length >= 6)
      ) {
        if (isBackspace) {
          event.preventDefault();
          return;
        }
      }
    }
  }

  formatDate(event: any) {
    const control = this.AddMemberDetails.birthdate;
    if (control && control.value !== undefined && control.value !== null) {
      let input = control.value;

      // Remove non-numeric characters except slashes
      let formattedInput = input.replace(/[^0-9/]/g, '');

      // Insert slashes after MM and DD
      if (formattedInput.length >= 3 && formattedInput.charAt(2) !== '/') {
        formattedInput =
          formattedInput.substring(0, 2) + '/' + formattedInput.substring(2);
      }
      if (formattedInput.length >= 6 && formattedInput.charAt(5) !== '/') {
        formattedInput =
          formattedInput.substring(0, 5) + '/' + formattedInput.substring(5);
      }

      // Limit the input to a maximum of 10 characters (MM/DD/YYYY)
      if (formattedInput.length > 10) {
        formattedInput = formattedInput.substring(0, 10);
      }

      // Set the formatted value back into the form control
      control.setValue(formattedInput);
    }
  }

  back() {
    if (this.alert != undefined && this.alert != null) {
      this.alert.dismiss();
    }
    this.router.navigate(['/tab1']);
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
        (data) => {
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
            'newMemberOptIn-ts',
            'getSpinWheelConfig(memberId: any)',
            error.message
          );
        }
      );
    await Promise.resolve(action);
  }

  get AddMemberDetails() {
    return this.multistep.controls['addMemberDetails']['controls'];
  }

  async submitData() {
    try {
      if (
        this.AddMemberDetails.optIn.value == '' &&
        this.dynamicField.isOptInRequired == true
      ) {
        this.showToast = true;
        this.toastMsg = 'Please select one option to opt-in.';
        // Hide the toast after 2 seconds
        this.toastID = setTimeout(() => {
          this.showToast = false;
        }, 5000);
      } else {
        let optin =
          this.AddMemberDetails.optIn.value == null ||
            this.AddMemberDetails.optIn.value == ''
            ? false
            : this.AddMemberDetails.optIn.value;
        if (
          optin.toString() == 'false' &&
          this.dynamicField.isOptInRequired == true
        ) {
          this.alert = await this.alertCtrl.create({
            header: "Are you sure you don't want to opt-in ? ",
            buttons: [
              {
                text: 'Yes',
                role: 'confirm',
                handler: () => {
                  this.Save();
                },
              },
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => { },
              },
            ],
          });
          await this.alert.present();
        } else {
          if (
            this.isOptInPopupRequired == true &&
            this.dynamicField.isOptInRequired == true
          ) {
            this.displayPopup = 'block';
          } else {
            this.Save();
          }
        }
      }
    } catch (error: any) {
      this._loggingService.PostLogger(
        'newMemberOptIn-ts',
        'submitData()',
        error.message
      );
    }
  }

  async submit() {
    if (this.isAgeRestriction == true) {
      if (
        this.AddMemberDetails.birthdate.valid ||
        this.AddMemberDetails.birthdate.disabled
      ) {
        if (this.AddMemberDetails.isOverAged.value?.toString() == 'true') {
          this.submitData();
        } else {
          this.showToast = true;
          this.toastMsg =
            `Please confirm that you are at least ${this.ageRestrictionYear} years old to proceed.`;
          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        }
      } else {
        this.showToast = true;
        this.toastMsg = 'Please enter valid birth date.';
        // Hide the toast after 2 seconds
        this.toastID = setTimeout(() => {
          this.showToast = false;
        }, 5000);
      }
    } else {
      this.submitData();
    }
  }

  async postTOTCMember() {
    let currentDate = CONSTANTS.ISODate();
    let TCMemberwiseDetails = {
      uniqueID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 0,
      memberProfileID: this.newMemberProfileData.id,
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

  async postMerchantTCMember() {
    let currentDate = CONSTANTS.ISODate();
    let TCMemberwiseDetails = {
      uniqueID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 0,
      memberProfileID: this.newMemberProfileData.id,
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

  async Save() {
    try {
      this.isLoading = true;
      if (this.isMemberExist == 'true') {
        let smsoptInValue =
          this.AddMemberDetails.optIn.value == null
            ? false
            : this.AddMemberDetails.optIn.value;
        let overAgedValue =
          this.isAgeRestriction == true
            ? this.AddMemberDetails.isOverAged.value
            : false;
        let idte = this.newMemberProfileData.id;

        this._memberProfile
          .PutSmsOptin(idte, smsoptInValue, overAgedValue)
          .subscribe(
            (data) => {
              let currentDate = CONSTANTS.ISODate();
              this.memberVistLog.MemberId = this.newMemberProfileData.id;
              this.memberVistLog.SignIn = currentDate;
              this.memberVistLog.SourceId = this.SourceID;
              this.memberVistLog.BusinessLocationId = this.BusinessLocationID;
              this.memberVistLog.StateId = 3;
              this.memberVistLog.IsActive = true;
              this.memberVistLog.CreatedBy = 1;
              this.memberVistLog.CreatedDate = currentDate;
              this.memberVistLog.LastModifiedBy = 1;
              this.memberVistLog.LastModifiedDate = currentDate;
              try {
                this._memberVisitLogService
                  .PostMemberVisitLog(this.memberVistLog)
                  .subscribe(async (data) => {
                    if (this.isTCAgree == false) {
                      if ( this.TOID != 0 &&
                        this.TOID != null &&
                        this.TOID != '' &&
                        this.TOID != undefined) {
                        this.postTOTCMember();
                      } else {
                        this.postMerchantTCMember();
                      }
                    }

                    let isUpdateBirthDate =
                      (this.newMemberBirthDate == '' ||
                        this.newMemberBirthDate == null ||
                        this.newMemberBirthDate == undefined) &&
                        this.AddMemberDetails.birthdate.value != '' &&
                        this.AddMemberDetails.birthdate.value != null &&
                        this.AddMemberDetails.birthdate.value != undefined
                        ? true
                        : false;
                    if (
                      this.isAgeRestriction == true &&
                      isUpdateBirthDate == true
                    ) {
                      if (this.AddMemberDetails.birthdate.value) {
                        let parts =
                          this.AddMemberDetails.birthdate.value.split('/');
                        let dateObj = new Date(
                          Date.UTC(
                            parseInt(parts[2]),
                            parseInt(parts[0]) - 1,
                            parseInt(parts[1])
                          )
                        );
                        let isoString = dateObj.toISOString();

                        this._memberProfile
                          .PutMemberBirthDate(
                            this.newMemberProfileData.memberId,
                            isoString
                          )
                          .subscribe(
                            (data) => {
                            },
                            async (error) => {
                            }
                          );
                      }
                    }

                    this.memberVisitLogRes = data;
                    if (this.memberVisitLogRes.id > 0) {
                      localStorage.removeItem('memberDetails');
                      this.m.name = this.newMemberName;
                      this.m.currentPoints =
                        this.newMemberProfileData.currentpoints;
                      this.m.memberId = this.newMemberProfileData.id;
                      this.m.memberTableID = this.newMemberProfileData.memberId;
                      this.m.memberSince =
                        this.newMemberProfileData.membersince;
                      this.m.badgeColor = this.newMemberProfileData.badgeColor;
                      this.m.memberImg = this.memberImage;

                      localStorage.setItem(
                        'memberDetails',
                        JSON.stringify(this.m)
                      );

                      await this.getReduceFnSpinwheelConfig();
                    }
                  });
              } catch (error: any) {
                this._loggingService.PostLogger(
                  'newMemberOptIn-ts',
                  'Save()',
                  error.message
                );
                this.isLoading = false;
              }
            },
            async (error) => {
              this._loggingService.PostLogger(
                'newMemberOptIn-ts',
                'Save()',
                error.message
              );
              this.isLoading = false;
              this.showToast = true;
              this.toastMsg = this.ApiTimeoutPeriod.errorMessage;
              // Hide the toast after 2 seconds
              this.toastID = setTimeout(() => {
                this.showToast = false;
              }, 5000);
            }
          );
      } else {
        let currentDate = CONSTANTS.ISODate();

        this.newMemberProfileData.smsoptIn =
          this.AddMemberDetails.optIn.value == null
            ? false
            : this.AddMemberDetails.optIn.value;
        this.newMemberProfileData.lastOptOutDate =
          this.AddMemberDetails.optIn.value == null ||
            this.AddMemberDetails.optIn.value == 'false'
            ? currentDate
            : null;

        this._memberProfile
          .PostMemberProfile(this.newMemberProfileData)
          .subscribe(
            (res: any) => {
              this.newMemberProfileRes = res;

              this.memberVistLog.MemberId = this.newMemberProfileRes.id;
              this.memberVistLog.SignIn = currentDate;
              this.memberVistLog.SourceId = this.SourceID;
              this.memberVistLog.BusinessLocationId = this.BusinessLocationID;
              this.memberVistLog.StateId = 3;
              this.memberVistLog.IsActive = true;
              this.memberVistLog.CreatedBy = 1;
              this.memberVistLog.CreatedDate = currentDate;
              this.memberVistLog.LastModifiedBy = 1;
              this.memberVistLog.LastModifiedDate = currentDate;

              try {
                this._memberVisitLogService
                  .PostMemberVisitLog(this.memberVistLog)
                  .subscribe(
                    (data) => {
                      if (!this.isTCAgree) {
                        if ( this.TOID != 0 &&
                          this.TOID != null &&
                          this.TOID != '' &&
                          this.TOID != undefined) {
                          this.postTOTCMember();
                        } else {
                          this.postMerchantTCMember();
                        }
                      }
                      this.memberVisitLogRes = data;
                      if (this.memberVisitLogRes.id > 0) {
                        this._memberProfile
                          .GetMemberProfileByPhoneNo(
                            this.BusinessGroupID,
                            this.BusinessLocationID,
                            this.phoneNumber
                          )
                          .subscribe(async (resProfile: any) => {
                            let d = resProfile;

                            let isUpdateBirthDate =
                              (this.newMemberBirthDate == '' ||
                                this.newMemberBirthDate == null ||
                                this.newMemberBirthDate == undefined) &&
                                this.AddMemberDetails.birthdate.value != '' &&
                                this.AddMemberDetails.birthdate.value != null &&
                                this.AddMemberDetails.birthdate.value != undefined
                                ? true
                                : false;
                            if (
                              this.isAgeRestriction == true &&
                              isUpdateBirthDate == true
                            ) {
                              if (this.AddMemberDetails.birthdate.value) {
                                let parts =
                                  this.AddMemberDetails.birthdate.value.split(
                                    '/'
                                  );
                                let dateObj = new Date(
                                  Date.UTC(
                                    parseInt(parts[2]),
                                    parseInt(parts[0]) - 1,
                                    parseInt(parts[1])
                                  )
                                );
                                let isoString = dateObj.toISOString();
                                this._memberProfile
                                  .PutMemberBirthDate(
                                    this.newMemberProfileData.memberId,
                                    isoString
                                  )
                                  .subscribe(
                                    (data) => { },
                                    async (error) => { }
                                  );
                              }
                            }

                            localStorage.removeItem('memberDetails');
                            this.m.name = this.newMemberName;
                            this.m.currentPoints =
                              this.newMemberProfileRes.currentPoints;
                            this.m.memberId = this.newMemberProfileRes.id;
                            this.m.memberTableID =
                              this.newMemberProfileRes.memberId;
                            this.m.memberSince =
                              this.newMemberProfileRes.createdDate;
                            this.m.badgeColor = d[0].badgeColor;
                            this.m.memberImg = this.memberImage;
                            localStorage.setItem(
                              'memberDetails',
                              JSON.stringify(this.m)
                            );

                            await this.getReduceFnSpinwheelConfig();
                          });
                      }
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
              } catch (error: any) {
                this._loggingService.PostLogger(
                  'newMemberOptIn-ts',
                  'Save()',
                  error.message
                );
                this.isLoading = false;
              }
            },
            async (error) => {
              this.isLoading = false;
              this._loggingService.PostLogger(
                'newMemberOptIn-ts',
                'Save()',
                error.message
              );
            }
          );
      }
    } catch (error: any) {
      this.isLoading = false;
      this._loggingService.PostLogger(
        'newMemberOptIn-ts',
        'Save()',
        error.message
      );
    }
  }

  async getReduceFnSpinwheelConfig() {
    this._spinWheelService
      .GetSpinWheelConfigByMemberIDBusinessLocationID(
        this.m.memberId,
        this.BusinessLocationID,
        1
      )
      .pipe()
      .subscribe(
        (data) => {
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
          this.router.navigate(['/tab2']);
          this.isLoading = false;
          this.display = '';
          this.phoneNumber = '';
        },
        async (error) => {
          this._loggingService.PostLogger(
            'newMemberOptIn-ts',
            'getReduceFnSpinwheelConfig()',
            error.message
          );
          if (error.status == 404) {
            this.router.navigate(['/customer-details']);
            this.isLoading = false;
            this.display = '';
            this.phoneNumber = '';
          }
        }
      );
  }

  async closePopupOptin() {
    this.Save();
    this.displayPopup = 'none';
  }

  dismissToast() {
    this.showToast = false;
    clearTimeout(this.toastID);
  }

  ngOnDestroy() {
    this.displayPopup = 'none';
    if (this.alert) {
      this.alert.dismiss();  // Dismiss the alert if the page is destroyed
    }
  }

  initializeCountdown() {
    const conuterNewOptIn =
      JSON.parse(localStorage.getItem('DynamicField') || '{}').conuterNewOptIn || 60;

    this.configNewOpt = {
      leftTime: conuterNewOptIn, // Set countdown time
      formatDate: ({ date }) => `${date / 1000}`,
    };
  }

  ionViewWillLeave() {
    if (this.countdownNewOpt) {
      this.countdownNewOpt.stop(); // Stop countdown to prevent background execution
    }
  }
}
