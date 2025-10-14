export enum JobStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ON_HOLD = 'On Hold',
  CLOSED = 'Closed',
  ARCHIVED = 'Archived',
  FILLED = 'Filled',
  CANCELLED = 'Cancelled'
}

export const JobStatusList = Object.values(JobStatus);

export const JobStatusOptions = [
  { value: JobStatus.DRAFT, label: 'Draft' },
  { value: JobStatus.PUBLISHED, label: 'Published' },
  { value: JobStatus.ON_HOLD, label: 'On Hold' },
  { value: JobStatus.CLOSED, label: 'Closed' },
  { value: JobStatus.ARCHIVED, label: 'Archived' },
  { value: JobStatus.FILLED, label: 'Filled' },
  { value: JobStatus.CANCELLED, label: 'Cancelled' },
];