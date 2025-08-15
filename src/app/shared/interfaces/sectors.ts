export interface SectorData {
  sector: string;
  count: number;
}

export interface TimelineData {
  date: string;       
  sector: string;
  attackType: string;
  severity: string;
  count: number;
}

export interface ChartDataset {
  sectors: SectorData[];
  timeline: TimelineData[];
}