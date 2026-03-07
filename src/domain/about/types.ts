export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutState {
  loaded: boolean;
}
