import { NgModule } from '@angular/core';
import { HostPageComponent } from './host-page.component';
import { EditHostPageComponent } from '../edit-page/edit-host-page.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistrationProgressBarModule } from '../../shared/components/registration-progress-bar/registration-progress-bar.module';
import { HostModule } from '../host.module';
import { ProfileFormModule } from '../../shared/components/profile-form/profile-form.module';

const routes = [
  {
    path: '',
    component: HostPageComponent
  },
  {
    path: ':memorialYear/:hostId/:meetingId',
    component: EditHostPageComponent
  }
];

@NgModule({
  imports: [ProfileFormModule, HostModule, RegistrationProgressBarModule, RouterModule.forChild(routes), CommonModule],
  declarations: [HostPageComponent, EditHostPageComponent]
})
export class HostPageModule {}
