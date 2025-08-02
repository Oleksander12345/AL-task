export interface LogEntry {
  experiment_id: string;
  metric_name: string;
  step: number;
  value: number;
}

export interface ExperimentGroup {
  [metricName: string]: { step: number; value: number }[];
}

export interface ExperimentData {
  [experimentId: string]: ExperimentGroup;
}
