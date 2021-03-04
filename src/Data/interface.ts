import { Document } from 'mongoose';

export interface DataDocument extends Document {
  _id: string;
  source: string;
  users: number;
  newUsers: number;
  sessions: number;
  bounceRate: number;
  firstSeenOn: Date;
  pagesPerSession: number;
  avgSessionDuration: string;
  conversionRate: number;
  goalValue: number;
}

export interface GetDataParams {
  page: number;
  itemsPerPage: number;
  search: string | undefined;
  sortBy: string | undefined;
  desc: boolean | undefined;
}
