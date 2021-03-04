import * as mongoose from 'mongoose';

export const DataSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    users: { type: Number, required: true },
    newUsers: { type: Number, required: true },
    sessions: { type: Number, required: true },
    bounceRate: { type: Number, required: true },
    firstSeenOn: { type: Date, required: true },
    pagesPerSession: { type: Number, required: true },
    avgSessionDuration: { type: String, required: true },
    conversionRate: { type: Number, required: true },
    goalValue: { type: Number, required: true },
  },
  { timestamps: true },
);
