import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import * as CONSTANTS from '../api/services/Constants';
import { map } from 'rxjs';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@Component({
  selector: 'app-networkConnectivity',
  templateUrl: 'networkConnectivity.page.html',
  styleUrls: ['networkConnectivity.page.scss'],
})
export class NetworkConnectivityPage implements ViewWillEnter {
  token: any;
  backgroundTaskFromNetwork: any;
  showToast: boolean = false;
  toastMsg: any = '';
  toastID: any;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private network: Network
  ) {
    this.token = localStorage.getItem('businessLocationId');
  }

  ionViewWillEnter() {
    //   this.ngOnInit();
  }

  ngOnInit() {
    // this.backgroundTaskFromNetwork = setInterval(this.connectWithRetry, 10000);
  }

  connectWithRetry = (retryCount: number = 0) => {
    this.GetLatestCustomerTabletAppVersion().subscribe(
      (res) => {
        clearInterval(this.backgroundTaskFromNetwork);
        if (this.token) {
          this.router.navigate(['tab1']);
        } else {
          this.router.navigate(['']);
        }
        return res;
      },
      async (error) => {
        if (error) {
          if (error.status == 0) {
            //when only status code with 0 returns then this will try for 3 times and then give a network related issue to user side
            retryCount++;
            //if any issue then it will try 3 times for connection...
            if (retryCount <= 5) {
              setTimeout(() => this.connectWithRetry(retryCount), 2000); // Retry after 5 seconds
            } else {
              this.router.navigate(['networkConnectivity']);
            }
          }
        }
      }
    );
  };

  GetLatestCustomerTabletAppVersion() {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT + 'DashBoard/GetLatestCustomerTabletAppVersion'
      )
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }

  back() {
    const connectionType = this.network.type;
    if (connectionType === 'none' || connectionType === 'unknown') {
      this.showToast = true;
      this.toastMsg = "No network connection.";
      // Hide the toast after 2 seconds
      this.toastID = setTimeout(() => {
        this.showToast = false;
      }, 3000);
    } else {
      if (this.token) {
        this.router.navigate(['tab1']);
      } else {
        this.router.navigate(['']);
      }
    }
  }

  dismissToast() {
    this.showToast = false;
    clearTimeout(this.toastID);
  }
}
