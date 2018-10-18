import Joi from 'joi';

const petId = Joi.number().integer()
  .description('Unique identifier for pet in database')
  .example(1)
  .label('PetId');

const petName = Joi.string()
  .description('Name of the pet')
  .example('Garfield')
  .label('PetName');

const petPayload = Joi.object({
  name: petName.required(),
}).label('PetPayload');

export {
  petId,
  petPayload,
};
