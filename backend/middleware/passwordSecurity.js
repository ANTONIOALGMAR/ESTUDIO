// Lista de senhas comuns que devem ser bloqueadas
const commonPasswords = [
  '12345678', 'password', '123456789', '12345678', 'admin123',
  'password123', 'admin', 'qwerty', 'abc123', '123123',
  'password1', 'admin1', 'root', 'user', 'test', 'guest',
  '11111111', '00000000', 'senha123', 'mudar123'
];

// Verificar se a senha não está na lista de senhas comuns
const checkWeakPassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password && commonPasswords.includes(password.toLowerCase())) {
    return res.status(400).json({
      message: 'Esta senha é muito comum e não pode ser usada. Escolha uma senha mais segura.'
    });
  }
  
  next();
};

// Verificar força da senha (adicional ao Joi)
const checkPasswordStrength = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[@$!%*?&]/.test(password),
    noRepeatedChars: !/(.)\\1{2,}/.test(password), // Não permite 3+ chars repetidos
    noSequential: !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/.test(password.toLowerCase())
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = passed >= 6 ? 'forte' : passed >= 4 ? 'média' : 'fraca';
  
  return {
    strength,
    score: passed,
    maxScore: Object.keys(checks).length,
    checks
  };
};

module.exports = {
  checkWeakPassword,
  checkPasswordStrength,
  commonPasswords
};