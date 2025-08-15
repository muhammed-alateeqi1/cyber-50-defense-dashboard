
export interface AttacksResponse {
  attackTypes: AttackType[];
  timeline: Timeline[];
}

export interface AttackType {
  type: string;
  count: number;
}

export interface Timeline {
  date: string;
  type: string;
  severity: string;
  count: number;
}

// للـ Chart Data
export interface ChartData {
  label: string;
  value: number;
}