import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'tab1',
    loadChildren: () => import('./tab1/tab1.module').then(m => m.Tab1PageModule)
    // loadChildren: () => import('./NewMember/NewMember.module').then(m => m.NewMemberPageModule)
  },
  {
    path: 'tab2',
    loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule)
  },
  {
    path: 'NewMember',
    loadChildren: () => import('./NewMember/NewMember.module').then(m => m.NewMemberPageModule)
  },
  {
    path: 'VerifyOtp',
    loadChildren: () => import('./VerifyOtp/VerifyOtp.module').then(m => m.VerifyOtpPageModule)
  },
  {
    path: 'NewMemberOptIn',
    loadChildren: () => import('./NewMemberOptIn/NewMemberOptIn.module').then(m => m.NewMemberOptInPageModule)
  },
  {
    path: 'customer-details',
    loadChildren: () => import('./customer-details/customer-details.module').then(m => m.CustomerDetailsPageModule)
  },
  {
    path: 'revord-summary',
    loadChildren: () => import('./revord-summary/revord-summary.module').then(m => m.RevordSummaryPageModule)
  },
  {
    path: 'networkConnectivity',
    loadChildren: () => import('./networkConnectivity/networkConnectivity.module').then(m => m.NetworkConnectivityPageModule)
  },
  {
    path: 'Favorites',
    loadChildren: () => import('./Favorites/Favorites.module').then(m => m.FavoritesPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
