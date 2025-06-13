import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { LoginComponentRoutingModule } from './login-routing.module';
import { GetMemberProfileService } from '../api/services/get-member-profile.service';
import { HttpClientModule } from '@angular/common/http';
import { MembersVistLog, Model } from '../tab2/model';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    LoginComponentRoutingModule,
    HttpClientModule,
    
  ],
  declarations: [LoginComponent],
  providers: [
    GetMemberProfileService,
    Model,
    MembersVistLog,
  ],
})
export class LoginModule { }
