const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/User.model');
require('dotenv').config({ path: '../../.env' }); // Aponta para o .env na raiz

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const createAdmin = async () => {
  try {
    // Conectar ao MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env file');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    rl.question('Enter full name for the new admin: ', async (fullName) => {
      rl.question('Enter email for the new admin: ', async (email) => {
        rl.question('Enter password for the new admin (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char): ', async (password) => {
          const passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$');
          if (!fullName || !email || !password || !passwordRegex.test(password)) {
            console.error('\nInvalid input. Please provide all fields. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            rl.close();
            process.exit(1);
          }

          // Verificar se o usuário já existe
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            console.error('\nAn admin with this email already exists.');
            rl.close();
            process.exit(1);
          }

          // Criptografar a senha
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Criar e salvar o novo admin
          const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            userType: 'admin' // Definido como admin
          });

          await newUser.save();
          console.log(`\nAdmin user '${fullName}' created successfully!`);

          rl.close();
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('Error during admin creation:', error.message);
    process.exit(1);
  }
};

createAdmin();
