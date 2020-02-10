import { Component, OnInit } from '@angular/core';
import { User, Meeting } from '../../../app/model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService, MEMORIAL_YEAR, BereavedMeeting, VolunteeringUser, UpdateBereavedStatus, UpdateBereavedGuidance } from '../../../app/services/data.service';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-admin-bereaveds-page',
  templateUrl: './admin-bereaveds-page.component.html',
  styleUrls: ['./admin-bereaveds-page.component.scss']
})
export class AdminBereavedsPageComponent implements OnInit {

  user: User;
  bereaveds: User[];
  noBerevedMeetings: Meeting[];
  filter: string = '';
  filteredBereaveds: User[];
  year = MEMORIAL_YEAR;

  selectedMeeting$ = new Subject<BereavedMeeting>();
  selectingBereaved: User;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.user = user;
    });
    this.dataService.getBereaveds().subscribe(bereaveds => {
      this.bereaveds = bereaveds;
      this.filterBereaveds();
    });
    this.dataService.getNoBerevedMeetings().subscribe(noBerevedMeetings => {
      this.noBerevedMeetings = noBerevedMeetings;
    });
  }

  filterBereaveds() {
    this.filteredBereaveds = this.utilsService.filteringBereaveds(this.bereaveds, this.filter);
  }

  joinBereved(bereaved: User) {
    this.selectingBereaved = bereaved;
    if (this.noBerevedMeetings && this.noBerevedMeetings.length) {
      this.selectedMeeting$.pipe(take(1)).subscribe((value: BereavedMeeting) => {
        this.selectingBereaved = null;
        if (value && value.meeting) {
          this.dataService.bereavedRegisterHost(bereaved, value.meeting);
        }
      })
    } else {
      this.selectingBereaved = null;
    }
  }

  leaveBereaved({ meeting, bereaved }: BereavedMeeting) {
    if (meeting && bereaved) {
      if (window.confirm('האם ברצונך להסיר את ' + bereaved.profile.firstName + ' ' + bereaved.profile.lastName + ' מהמפגש ' + meeting.title + '?')) {
        this.dataService.bereavedLeaveHost(bereaved, meeting);
      }
    }
  }

  volunteering({ user, isVolunteer }: VolunteeringUser) {
    if (user) {
      if (window.confirm('האם ברוצנך ' + (isVolunteer ? 'להגדיר' : 'להסיר') + ' את ' + user.profile.firstName + ' ' + user.profile.lastName + ' כמתנדב/ת?')) {
        this.dataService.setUserVolunteer(user, isVolunteer);
      }
    }
  }

  bereavedStatus({ bereaved, status }: UpdateBereavedStatus) {
    if (bereaved) {
      this.dataService.setBereavedStatus(bereaved, status);
    }
  }

  bereavedGuidance({ bereaved, guidance }: UpdateBereavedGuidance) {
    if (bereaved) {
      this.dataService.setBereavedGuidance(bereaved, guidance);
    }
  }
}
