import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-NewMember',
  templateUrl: 'NewMember.page.html',
  styleUrls: ['NewMember.page.scss'],
})
export class NewMemberPage implements OnDestroy {
  prog1NewMember: any;
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
  newMemberData: any;
  monthlist: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
      name: new FormControl(''),
      email: new FormControl(
        '',
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
      ),
      monthID: new FormControl(''),
      dayID: new FormControl(''),
      isOverAged: new FormControl(false),
      optIn: new FormControl('', Validators.required),
      birthdate: new FormControl('', [
        Validators.pattern(
          /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/(19|20)[0-9]{2}$/
        ),
      ]),
    }),
  });
  BusinessGroupID: any = localStorage.getItem('businessGroupId');
  BusinessLocationID: any = localStorage.getItem('businessLocationId');
  SourceID: any = localStorage.getItem('sourceId');
  businessGroupName: any = localStorage.getItem('businessGroupName');
  days: number[];
  isMonthSelect: any = false;
  isAgeRestriction: boolean;
  ageRestrictionYear: number;
  isOptInPopupRequired: boolean;
  OptInPopupText: string;
  dynamicField: any;
  data: any;
  bgImg: any = localStorage.getItem('BgImg');
  alert: any;
  birthdate: string = '';
  pattern: string = '^d{2}/d{2}/d{4}$';
  showToast: boolean = false;
  toastMsg: any = '';
  toastID: any;
  ApiTimeoutPeriod: any;

  constructor(
    private router: Router,
    private _memberProfile: GetMemberProfileService,
    private _loggingService: LoggingService,
    private _spinWheelService: SpinWheelService,
    private m: Model,
    public activatedRoute: ActivatedRoute,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    private alertCtrl: AlertController,
  ) {
    if (!localStorage.getItem('JWT_Token')) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');

    this.days = Array.from({ length: 31 }, (_, i) => i + 1);

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['memberPhone']) {
        this.phoneNumber = JSON.parse(params['memberPhone']);
      }

      if (params && params['isAgeRestriction']) {
        this.isAgeRestriction = JSON.parse(params['isAgeRestriction']);
      }
      if (this.isAgeRestriction == true) {
        this.AddMemberDetails.birthdate?.setValidators([Validators.required]);
      } else {
        this.AddMemberDetails.birthdate?.clearValidators(); // Remove validators if not required
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

  config: CountdownConfig = {
    leftTime:
      60 *
      (JSON.parse(localStorage.getItem('DynamicField') || '{}')
        .counterNewMember /
        60),
    formatDate: ({ date }) => `${date / 1000}`,
  };

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

  ionViewWillLeave() {
    if (this.countdown) {
      this.countdown.stop(); // Stop countdown to prevent background execution
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

  get Email() {
    return this.multistep.controls['addMemberDetails'].get('email');
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
            'newMember-ts',
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
      if (this.AddMemberDetails.birthdate.valid) {
        if (
          (this.AddMemberDetails.optIn.value == null ||
            this.AddMemberDetails.optIn.value == '') &&
          this.dynamicField.isOptInRequired == true
        ) {
          this.showToast = true;
          this.toastMsg = 'Please select one option to opt-in.';

          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        } else {
          let currentDate = CONSTANTS.ISODate();
          let currentYear = new Date().getFullYear();
          this.newMemberData = {
            uniqueID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            id: 0,
            memberName:
              this.AddMemberDetails.name.value == '' ||
                this.AddMemberDetails.name.value == null ||
                this.AddMemberDetails.name.value == undefined
                ? 'USER ' + this.phoneNumber.substring(5).toString()
                : this.AddMemberDetails.name.value,
            birthDate:
              this.AddMemberDetails.birthdate.value == '' ||
                this.AddMemberDetails.birthdate.value == null ||
                this.AddMemberDetails.birthdate.value == undefined
                ? null
                : this.AddMemberDetails.birthdate.value,
            emailID:
              this.AddMemberDetails.email.value == '' ||
                this.AddMemberDetails.email.value == null ||
                this.AddMemberDetails.email.value == undefined
                ? null
                : this.AddMemberDetails.email.value,
            phoneNo: Number(this.phoneNumber),
            isActive: true,
            createdBy: 1,
            createdDate: currentDate,
            lastModifiedBy: 1,
            lastModifiedDate: currentDate,
            businessLocationId: this.BusinessLocationID,
            memberProfile: [
              {
                uniqueId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                id: 0,
                memberId: 0,
                notes: null,
                badgeId: 1,
                tagId: null,
                businessGroupId: this.BusinessGroupID,
                lastVisitDate: currentDate,
                lifeTimePoints: 0,
                lifeTimeVisits: 0,
                smsoptIn:
                  this.AddMemberDetails.optIn.value == null ||
                    this.AddMemberDetails.optIn.value == ''
                    ? false
                    : this.AddMemberDetails.optIn.value,
                emailOptIn:
                  this.AddMemberDetails.email.value == '' ||
                    this.AddMemberDetails.email.value == null ||
                    this.AddMemberDetails.email.value == undefined
                    ? false
                    : true,
                notificationOptIn: false,
                currentPoints: 0,
                sourceId: this.SourceID,
                stateId: 3,
                isActive: true,
                createdBy: 1,
                createdDate: currentDate,
                lastModifiedBy: 1,
                lastModifiedDate: currentDate,
                isHighroller: false,
                isFreePlayer: false,
                baseLocationID: this.BusinessLocationID,
                isOverAged:
                  this.isAgeRestriction == true
                    ? this.AddMemberDetails.isOverAged.value
                    : false,
                LastOptOutDate:
                  this.AddMemberDetails.optIn.value == null ||
                    this.AddMemberDetails.optIn.value == '' ||
                    this.AddMemberDetails.optIn.value == 'false'
                    ? currentDate
                    : null,
              },
            ],
          };
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
              header: "Are you sure you don't want to opt-in ?",
              buttons: [
                {
                  text: 'Yes',
                  role: 'confirm',
                  handler: () => {
                    this.Save(this.newMemberData);
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
              this.Save(this.newMemberData);
            }
          }
        }
      } else {
        this.showToast = true;
        this.toastMsg = 'Please enter valid birth date.';

        // Hide the toast after 2 seconds
        this.toastID = setTimeout(() => {
          this.showToast = false;
        }, 5000);
      }
    } catch (error: any) {
      this._loggingService.PostLogger(
        'newMember-ts',
        'submitData()',
        error.message
      );
    }
    // }
  }

  async submit() {
    if (this.Email?.valid) {
      if (this.isAgeRestriction == true) {
        if (
          this.AddMemberDetails.birthdate.value == '' ||
          this.AddMemberDetails.birthdate.value == null ||
          this.AddMemberDetails.birthdate.value == undefined
        ) {
          this.showToast = true;
          this.toastMsg = 'Please enter your birthdate.';

          // Hide the toast after 2 seconds
          this.toastID = setTimeout(() => {
            this.showToast = false;
          }, 5000);
        } else {
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
        }
      } else {
        this.submitData();
      }
    } else {
      this.showToast = true;
      this.toastMsg = 'Please enter a valid email address.';
      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  }

  async Save(newMemberData: any) {
    try {
      this.isLoading = true;
      this._memberProfile.PostNewMemberInStore(newMemberData).subscribe(
        async (res: any) => {
          let members = res;
          this._memberProfile
            .GetMemberProfileByPhoneNo(
              this.BusinessGroupID,
              this.BusinessLocationID,
              this.phoneNumber
            )
            .subscribe(
              (resProfile: any) => {
                let d = resProfile;
                localStorage.removeItem('memberDetails');
                this.m.name = members.memberName;
                this.m.currentPoints = members.memberProfile[0].currentPoints;
                this.m.memberId = members.memberProfile[0].id;
                this.m.memberTableID = members.memberProfile[0].memberId;
                this.m.memberSince = members.memberProfile[0].createdDate;
                this.m.badgeColor = d[0].badgeColor;
                localStorage.setItem('memberDetails', JSON.stringify(this.m));

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
                      localStorage.setItem(
                        'OPTS',
                        JSON.stringify(this._defaultOpts)
                      );

                      this.phoneNumber = '';
                      this.isLoading = false;
                      this.router.navigate(['/tab2']);
                    },
                    async (error) => {
                      this.isLoading = false;
                      this._loggingService.PostLogger(
                        'newMember-ts',
                        'Save(newMemberData: any)',
                        error.message
                      );

                      this.router.navigate(['/customer-details']);
                      this.phoneNumber = '';
                    }
                  );
              },
              async (error) => {
                this.isLoading = false;
                this._loggingService.PostLogger(
                  'newMember-ts',
                  'Save(newMemberData: any)',
                  error.message
                );
                this.router.navigate(['/tab1']);
                this.phoneNumber = '';
              }
            );
        },
        async (error) => {
          this._loggingService.PostLogger(
            'newMember-ts',
            'Save(newMemberData: any)',
            error.message
          );
          if (error.status == 409) {
            this.isLoading = false;
            this.showToast = true;
            this.toastMsg = "You're already a member. Please sign in again!";
            this.toastID = setTimeout(() => {
              this.showToast = false;
            }, 5000);
            this.router.navigate(['/tab1']);
            // Hide the toast after 2 seconds
          } else {
            this.isLoading = false;
            this.showToast = true;
            this.toastMsg = this.ApiTimeoutPeriod.errorMessage;

            // Hide the toast after 2 seconds
            this.toastID = setTimeout(() => {
              this.showToast = false;
            }, 5000);
          }
        }
      );
    } catch (error: any) {
      this._loggingService.PostLogger(
        'newMember-ts',
        'Save(newMemberData: any)',
        error.message
      );
      this.isLoading = false;
    }
  }

  async closePopupOptin() {
    this.Save(this.newMemberData);
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
    const counterNewMember =
      JSON.parse(localStorage.getItem('DynamicField') || '{}').counterNewMember || 60;

    this.config = {
      leftTime: counterNewMember, // Set countdown time
      formatDate: ({ date }) => `${date / 1000}`,
    };
  }
}
