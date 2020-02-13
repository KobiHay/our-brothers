import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Meeting, User } from 'src/app/model';
import { ParticipationsService } from 'src/app/services/participations.service';

@Component({
  selector: 'app-join-button',
  templateUrl: './join-button.component.html',
  styleUrls: ['./join-button.component.scss']
})
export class JoinButtonComponent {

  @Input() user: User;
  @Input() meeting: Meeting;

  @Output() joinMeeting = new EventEmitter<void>();

  constructor(public participationsService: ParticipationsService) { }
}
