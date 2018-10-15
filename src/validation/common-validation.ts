import Joi from 'joi';
export const apiKey = Joi.string()
  .description('Api key to be passed in x-api-key request header')
  .example('secret')
  .label('ApiKey');

export const limit = Joi.number().integer().positive()
  .description('Number of items to return')
  .example(25)
  .label('QueryLimit');

export const offset = Joi.number().integer().min(0)
  .description('Starting offset for returning items')
  .example(0)
  .label('QueryOffset');
