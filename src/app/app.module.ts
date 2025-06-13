import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { GetMemberProfileService } from './api/services/get-member-profile.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ActivityHistory, MembersVistLog, Model } from './tab2/model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from './api/model';
import { Market } from '@awesome-cordova-plugins/market/ngx';
import { BackgroundService } from './api/services/backgroundService';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { TokenInterceptor } from './api/services/token.interceptor';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { NetworkService } from './api/services/NetworkService';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { dbConfig } from './api/services/indexed-db.config';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, 
    NgxIndexedDBModule.forRoot(dbConfig)   
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    GetMemberProfileService,
    Model,
    MembersVistLog,
    ActivityHistory,
    User,
    AppVersion,    
    BackgroundMode,
    BackgroundService,
    Market,
    File,
    Network,
    NetworkService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
