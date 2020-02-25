import { UserProfile } from './user';

export interface Meeting {
  hostId: string;
  id: string;
  title: string;
  address: MeetingAddress;
  date: number;
  contact: UserProfile;
  capacity: number;
  count: number;
  invited: boolean;
  accessibility: boolean;
  media: boolean;
  reviewable: boolean;
  audience: MeetingAudience;
  bereaved?: MeetingBereaved;
}

export interface MeetingParticipate {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accompanies: number;
}

export interface Address {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface MeetingAddress extends Address {
  notes?: string;
}

export interface MeetingBereaved {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  slains: { firstName: string; lastName: string; }[];
}

export enum MeetingAudience {
  all = "all",
  schoolStudents = "schoolStudents",
  youthMovement = "youthMovement",
  militaryPreparation = "militaryPreparation",
  soldiers = "soldiers",
  students = "students"
}

export const MeetingAudienceLabels: { [audience in MeetingAudience]: string } = {
  all: 'כולם',
  schoolStudents: 'תלמידים',
  youthMovement: 'תנועות נוער',
  militaryPreparation: 'מכינות',
  soldiers: 'חיילים',
  students: 'סטודנטים'
}
