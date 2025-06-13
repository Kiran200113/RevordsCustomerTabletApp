import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MembersVistLog, Model } from '../tab2/model';
import { ILoggerService } from '../api/services/ilogservice';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [Tab1Page],
  providers: [
    GetMemberProfileService,
    HttpClient,
    Model,
    MembersVistLog,
    ILoggerService,
  ],
})
export class Tab1PageModule {}
