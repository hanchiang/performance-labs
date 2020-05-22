// Types for services

export interface AddChartValue {
  logId: number;
  logValue: number;
  currentChartValue: number;
}

export interface AddLog {
  userId: string;
  datetime: string;
  value: number;
}
