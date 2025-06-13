import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ToastController } from '@ionic/angular';
import * as CONSTANTS from './Constants';
import { ILoggerService } from './ilogservice';
import { LoggingService } from './loggingService';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(private network: Network, private toastCtrl: ToastController, private http: HttpClient, private _iloggerService: ILoggerService,
    private logService: LoggingService, private router: Router
  ) { }

  // Check initial network status
  async checkConnection() {
    const connectionType = this.network.type;
    if (connectionType === 'none' || connectionType === 'unknown') {
      let message = 'NetworkLog - No network connection.';
      // const folderName = 'Download/CustomerApp_Network-Logs/';
      // this._iloggerService.saveJsonFile(message, folderName);
      this.logService.PostLogger("NetworkService", "checkConnection()", message);
      this.router.navigate(['networkConnectivity']);
      return false;
    } else {
      let message = 'NetworkLog - Connected via: ' + connectionType;
      // const folderName = 'Download/CustomerApp_Network-Logs/';
      // this._iloggerService.saveJsonFile(message, folderName);
      this.logService.PostLogger("NetworkService", "checkConnection()", message);
      return true;
    }
  }

  // async checkLatency() {
  //   const startTime = new Date().getTime();
  //   const url = CONSTANTS.API_ENDPOINT + 'DashBoard/GetLatestCustomerTabletAppVersion';// Lightweight URL for ping test

  //   try {
  //     await this.http.get(url).toPromise();
  //     const endTime = new Date().getTime();
  //     const latency = endTime - startTime;

  //     alert(`Latency: ${latency} ms`);

  //     if (latency > 1000) {
  //       console.warn('High latency detected, possible low bandwidth.');
  //     }
  //   } catch (error) {
  //     console.error('Failed to connect. Network issue?', error);
  //   }
  // }


  // Listen to network status changes
  async listenToNetworkChanges() {
    // When disconnected
    this.network.onDisconnect().subscribe(async () => {
      let message = 'NetworkLog - Network disconnected!';      
      this.logService.PostLogger("NetworkService", "listenToNetworkChanges()", message);
      this.router.navigate(['networkConnectivity'], { replaceUrl: true });
    });

    // When reconnected
    this.network.onConnect().subscribe(async () => {
      let message = 'NetworkLog - Network connected!';
      this.logService.PostLogger("NetworkService", "listenToNetworkChanges()", message);
      this.logService.uploadOfflineLogs();
      const token = localStorage.getItem('JWT_Token');

      if (token) {
        this.router.navigate(['tab1']);
      } else {
        this.router.navigate(['']);
      }
    });
  }
}