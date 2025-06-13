import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundService } from './api/services/backgroundService';
import { NetworkService } from './api/services/NetworkService';
import { DynamicFieldService } from './api/services/dynamicFieldService';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private backgroundService: BackgroundService,
    private networkService: NetworkService,
    private _dynamicFieldService: DynamicFieldService
  ) {    
    this.GetErrorMessageForTabletApp();
    this.backgroundService.startBackgroundTask();
    this.networkService.checkConnection();
    this.networkService.listenToNetworkChanges();

  }

  GetErrorMessageForTabletApp() {
    this._dynamicFieldService.GetErrorMessageForTabletApp().subscribe((data: any) => {
      localStorage.setItem("ErroMessageData", JSON.stringify(data));
      const token = localStorage.getItem('JWT_Token');
      if (token) {
        this.router.navigate(['tab1']);
      } else {
        this.router.navigate(['']);
      }
    }, async (error) => {
      const token = localStorage.getItem('JWT_Token');
      if (token) {
        this.router.navigate(['tab1']);
      } else {
        this.router.navigate(['']);
      }
      // this._appService.PostLogFromFrontEnd('tab2-ts', 'ngOnInit()', error.message);
      // this._appService.toastMessage(
      //   'Something went wrong, please try again or contact support.',
      //   2000,
      //   'custom-toast'
      // );
    })
  }
}
