const Joi = require('joi');

// Middleware de validação genérico
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // Pega a primeira mensagem de erro para enviar ao cliente
      const errorMessage = error.details[0].message;
      return res.status(400).json({ message: errorMessage });
    }
    next();
  };
};

// Esquema de validação para o registro de usuário
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).required().messages({
    'string.base': 'O nome completo deve ser um texto.',
    'string.empty': 'O nome completo não pode estar vazio.',
    'string.min': 'O nome completo deve ter no mínimo {#limit} caracteres.',
    'any.required': 'O campo nome completo é obrigatório.'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'O email deve ser um texto.',
    'string.empty': 'O email não pode estar vazio.',
    'string.email': 'Por favor, forneça um email válido.',
    'any.required': 'O campo email é obrigatório.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'A senha deve ser um texto.',
    'string.empty': 'A senha não pode estar vazia.',
    'string.min': 'A senha deve ter no mínimo {#limit} caracteres.',
    'any.required': 'O campo senha é obrigatório.'
  }),
  userType: Joi.string().valid('admin', 'customer').required().messages({
    'string.base': 'O tipo de usuário deve ser um texto.',
    'string.empty': 'O tipo de usuário não pode estar vazio.',
    'any.only': "O tipo de usuário deve ser 'admin' ou 'customer'.",
    'any.required': 'O campo tipo de usuário é obrigatório.'
  })
});

// Esquema de validação para o login de usuário
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'O email deve ser um texto.',
    'string.empty': 'O email não pode estar vazio.',
    'string.email': 'Por favor, forneça um email válido.',
    'any.required': 'O campo email é obrigatório.'
  }),
  password: Joi.string().required().messages({
    'string.base': 'A senha deve ser um texto.',
    'string.empty': 'A senha não pode estar vazia.',
    'any.required': 'O campo senha é obrigatório.'
  })
});

module.exports = {
  validate,
  registerSchema,
  loginSchema
};
