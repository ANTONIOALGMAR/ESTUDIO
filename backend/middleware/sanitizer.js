const { body, query, param } = require('express-validator');

// Middleware de sanitização global.
// Aplica .trim() e .escape() a todos os campos em body, query, e params.
// .escape() transforma caracteres como <, >, &, ', " em suas entidades HTML, prevenindo XSS.
const sanitizeAll = [
  body('*').trim().escape(),
  query('*').trim().escape(),
  param('*').trim().escape(),
];

module.exports = { sanitizeAll };
