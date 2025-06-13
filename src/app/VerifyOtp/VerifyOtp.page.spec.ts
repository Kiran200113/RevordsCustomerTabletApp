import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { VerifyOtpPage } from './VerifyOtp.page'

describe('VerifyOtpPage', () => {
  let component: VerifyOtpPage;
  let fixture: ComponentFixture<VerifyOtpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyOtpPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
