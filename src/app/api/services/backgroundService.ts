import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Router } from '@angular/router';
import { Market } from '@awesome-cordova-plugins/market/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { ILoggerService } from './ilogservice';
import { LoggingService } from './loggingService';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  version: any;


  constructor(
    private http: HttpClient,
    private backgroungMode: BackgroundMode,
    private appVersionNative: AppVersion,
    private router: Router,
    private toastCtrl: ToastController,
    private _iloggerService: ILoggerService,
    private loggingService: LoggingService
  ) { }

  startBackgroundTask() {
    this.backgroungMode.enable();
    // const backgroundTask = setInterval(this.connectWithRetry, 10000); // retry every 15 seconds this will be modified
  }

  // connectWithRetry = (retryCount: number = 0) => {
  //   this.GetLatestCustomerTabletAppVersion().subscribe(
  //     (res) => {
  //       return res;
  //     },
  //     async (error) => {
  //       if (error) {
  //         if (error.status == 0) {//when only status code with 0 returns then this will try for 3 times and then give a network related issue to user side
  //           retryCount++;
  //           //if any issue then it will try 3 times for connection...
  //           if (retryCount <= 5) {
  //             setTimeout(() => this.connectWithRetry(retryCount), 2000); // Retry after 5 seconds
  //           } else {
  //             this.router.navigate(['networkConnectivity']);
  //           }
  //         }
  //       }
  //     }
  //   );
  // };

  connectWithRetry = (retryCount: number = 0) => {
    const startTime = new Date().getTime();

    this.GetLatestCustomerTabletAppVersion().subscribe(
      async (res) => {
        const endTime = new Date().getTime();
        const latency = endTime - startTime;

        if (latency > 1000) {
          let message = 'NetworkLog - High latency detected, possible low bandwidth. ' + latency + ' ms.';
          // const folderName = 'Download/CustomerApp_Network-Logs/';
          // this._iloggerService.saveJsonFile(message, folderName);

          this.loggingService.PostLogger("BackgroundService", "connectWithRetry()", message);
        }

        return res;
      },
      async (error) => {
        const endTime = new Date().getTime();
        const latency = endTime - startTime;

        if (latency > 1000) {
          let message = 'High latency detected, possible low bandwidth. ' + latency + ' ms.';
          // const folderName = 'Download/CustomerApp_Network-Logs/';
          // this._iloggerService.saveJsonFile(message, folderName);

          this.loggingService.PostLogger("BackgroundService", "connectWithRetry()", message);
        }

        if (error) {
          if (error.status == 0) {
            retryCount++;
            if (retryCount <= 5) {
              setTimeout(() => this.connectWithRetry(retryCount), 2000);  // Retry after 2 seconds
            } else {
              this.router.navigate(['networkConnectivity']);
            }
          }
        }
      }
    );
  };


  // connectWithRetry = async (retryCount: number = 0) => {
  //   console.log('called');
  //   const startTime = new Date().getTime();
  //   const url = CONSTANTS.API_ENDPOINT + 'DashBoard/GetLatestCustomerTabletAppVersion';// Lightweight URL for ping test

  //   try {
  //     await this.http.get(url).toPromise();
  //     const endTime = new Date().getTime();
  //     const latency = endTime - startTime;
  //     console.log(latency);

  //     if (latency > 1000) {
  //       const toast = await this.toastCtrl.create({
  //         message: 'High latency detected, possible low bandwidth. ' + latency + "ms.",
  //         duration: 3000,
  //       });
  //       toast.present();
  //       console.log('High latency detected, possible low bandwidth.');
  //     }
  //   } catch (error) {
  //     const toast = await this.toastCtrl.create({
  //       message: 'Failed to connect. Network issue?',
  //       duration: 3000,
  //     });
  //     toast.present();
  //     console.log('Failed to connect. Network issue?', error);
  //   }
  // }
  GetLatestCustomerTabletAppVersion() {
    return this.http
      .get<any>(
        CONSTANTS.API_ENDPOINT + 'DashBoard/GetLatestCustomerTabletAppVersion'
      )
      .pipe(
        map((member) => {
          return member;
        })
      );
  }
}
