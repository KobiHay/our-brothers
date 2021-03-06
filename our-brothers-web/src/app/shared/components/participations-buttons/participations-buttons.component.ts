import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { User } from 'models';

@Component({
  selector: 'app-participations-buttons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './participations-buttons.component.html',
  styleUrls: ['./participations-buttons.component.scss']
})
export class ParticipationsButtonsComponent {
  @Input() user: User;
  @Input() loading: boolean;
}
