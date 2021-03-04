import { IsNumber, IsMongoId } from 'class-validator';
import * as Joi from 'joi';

export class MongodbId {
  @IsMongoId()
  id: string;
}

export class UpdateGoalValuePayload {
  @IsNumber()
  goalValue: number;
}

// validate query params of GET data end-point
export const getDataSchema = Joi.object({
  page: Joi.number()
    .required()
    .min(0),
  itemsPerPage: Joi.number()
    .required()
    .min(1),
  search: Joi.string().optional(),
  sortBy: Joi.string(),
  desc: Joi.boolean(),
}).and('sortBy', 'desc');

// validate row data of the csv file to be imported
export const rowDataSchema = Joi.object({
  source: Joi.string()
    .required()
    .min(1),
  users: Joi.number().required(),
  newUsers: Joi.number().required(),
  sessions: Joi.number().required(),
  bounceRate: Joi.number().required(),
  firstSeenOn: Joi.date().required(),
  pagesPerSession: Joi.number().required(),
  avgSessionDuration: Joi.string()
    .required()
    .min(1),
  conversionRate: Joi.number().required(),
  goalValue: Joi.number().required(),
});
