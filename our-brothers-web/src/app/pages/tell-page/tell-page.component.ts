import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ParticipationsService } from 'src/app/services/participations.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import {
  BereavedGuidanceGeneral,
  Meeting,
  User,
  BereavedProfile,
  Slain
} from 'src/app/model';
import { ViewOptions } from 'src/app/components/view-toggle/view-toggle.component';
import { UtilsService } from 'src/app/services/utils.service';

const oneWeek = 1000 * 60 * 60 * 24 * 7;

@Component({
  selector: 'app-tell-page',
  templateUrl: './tell-page.component.html',
  styleUrls: ['./tell-page.component.scss']
})
export class TellPageComponent implements OnInit {
  public currentStep = 0;
  public casualtyDetailsFrom: FormGroup;
  public trainingSession = false;
  public userSubscription: Subscription;

  // Meetings
  public view: ViewOptions = 'list';
  public meetings: Meeting[];
  public filteredMeetings: Meeting[];
  public mapShowGuide = false;
  public mapShowLegend = false;
  public filter = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private participationsService: ParticipationsService,
    private dataService: DataService,
    private utilsService: UtilsService
  ) {}

  ngOnInit() {
    this.casualtyDetailsFrom = this.fb.group({
      casualtyFname: ['', Validators.required],
      casualtyLname: ['', Validators.required],
      casualtyDate: ['', Validators.required],
      casualtyStory: ['', Validators.required]
    });
  }

  configureMeetingsMap() {
    if (
      !(
        this.authService.currentUser &&
        this.authService.currentUser.meetingMapGuideLastVisit &&
        Date.now() - this.authService.currentUser.meetingMapGuideLastVisit <
          oneWeek
      )
    ) {
      this.mapShowGuide = true;
    } else {
      this.mapShowLegend = true;
    }
  }

  get casualtyFname() {
    return this.casualtyDetailsFrom.get('casualtyFname');
  }

  get casualtyLname() {
    return this.casualtyDetailsFrom.get('casualtyLname');
  }

  get casualtyDate() {
    return this.casualtyDetailsFrom.get('casualtyDate');
  }

  get casualtyStory() {
    return this.casualtyDetailsFrom.get('casualtyStory');
  }

  goToStep1() {
    if (
      this.authService.currentUser &&
      this.participationsService.isUserHaveAllDetails(
        this.authService.currentUser
      )
    ) {
      this.configureMeetingsMap();
      this.goToStep2();
      return;
    }

    this.currentStep = 1;
    this.authService.requestToLogin();
    this.userSubscription = this.authService.user.subscribe(user => {
      if (user && this.participationsService.isUserHaveAllDetails(user)) {
        this.configureMeetingsMap();
        this.goToStep2();
        this.userSubscription.unsubscribe();
      }
    });
  }

  goToStep2() {
    if (
      this.participationsService.isBrotherHaveSlainDetails(
        this.authService.currentUser
      )
    ) {
      this.goToStep3();
    } else {
      this.currentStep = 2;
    }
  }

  saveBereavedProfile() {
    let slains: Slain[] = [];
    if (
      this.authService.currentUser.bereavedProfile &&
      this.authService.currentUser.bereavedProfile.slains &&
      this.authService.currentUser.bereavedProfile.slains.length > 0
    ) {
      slains = this.authService.currentUser.bereavedProfile.slains;
    }

    slains.push({
      deathDate: this.casualtyDetailsFrom.get('casualtyDate').value,
      firstName: this.casualtyDetailsFrom.get('casualtyFname').value,
      lastName: this.casualtyDetailsFrom.get('casualtyLname').value
    });

    const bereavedProfile: BereavedProfile = {
      slains,
      story: this.casualtyDetailsFrom.get('casualtyStory').value
    };
    this.dataService
      .setBereavedProfile(this.authService.currentUser, bereavedProfile)
      .subscribe(() => {
        this.goToStep3();
      });
  }

  goToStep3() {
    if (
      this.participationsService.isBrotherAnsweredTrainingMeeting(
        this.authService.currentUser
      )
    ) {
      this.goToStep4();
    } else {
      this.currentStep = 3;
    }
  }

  saveTraningAnswer() {
    this.dataService
      .setBereavedGuidanceAnswer(this.authService.currentUser, {
        answered: true,
        general: BereavedGuidanceGeneral.telAviv
      })
      .subscribe(() => {
        this.goToStep4();
      });
  }

  goToStep4() {
    this.currentStep = 4;
    this.getMeetings();
  }

  getMeetings() {
    this.dataService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;
      this.filterMeetings();
    });
  }

  filterMeetings() {
    this.filteredMeetings = this.utilsService.filteringMeetings(
      this.meetings,
      this.filter
    );
  }

  onMapGuideCompleted() {
    this.mapShowGuide = true;
    this.mapShowLegend = true;
    if (this.authService.currentUser && this.authService.currentUser.id) {
      this.dataService.updateUserData(this.authService.currentUser.id, {
        meetingMapGuideLastVisit: Date.now()
      });
    }
  }

  onJoinMeeting({ user, meeting }: { user: User; meeting: Meeting }) {
    if (window.confirm('האם ברצונך להשתבץ למפגש?')) {
      if (user.role === 'bereaved') {
        this.dataService
          .bereavedRegisterHost(user, meeting)
          .subscribe(result => {
            if (result) {
              window.alert('שובצת בהצלחה!');
            }
          });
      }
    }
  }
}