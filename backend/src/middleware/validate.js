const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map(d => d.message).join('; ');
    return next(new ValidationError(message));
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    bio: Joi.string().max(500),
    skillsOffered: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
      category: Joi.string(),
    })),
    skillsWanted: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced'),
      category: Joi.string(),
    })),
    availability: Joi.array(),
  }),
  createSession: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(20).max(2000).required(),
    skillTag: Joi.string().required(),
    category: Joi.string(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
    duration: Joi.number().min(15).max(60).required(),
    creditCost: Joi.number().min(1).max(50).required(),
    maxSeats: Joi.number().min(1).max(20).default(1),
    sessionType: Joi.string().valid('one-to-one', 'group').default('one-to-one'),
    startTime: Joi.date().greater('now').required(),
    tags: Joi.array().items(Joi.string()).max(10),
  }),
  createReview: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    password: Joi.string().min(8).max(128).required(),
  }),
};

module.exports = { validate, schemas };
