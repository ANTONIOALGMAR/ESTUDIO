require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Service = require('../models/Service.model');

const servicesToSeed = [
  { name: 'Lavagem Basica', description: 'Lavagem externa simples.', price: 120, duration: 60 },
  { name: 'Lavagem Técnica', description: 'Lavagem detalhada com técnicas avançadas.', price: 120, duration: 120 },
  { name: 'Higienizacao de Tecido/Couro', description: 'Limpeza profunda de bancos e interiores.', price: 120, duration: 180 },
  { name: 'Hidratacao de Couro', description: 'Hidratação e proteção para bancos de couro.', price: 120, duration: 90 },
  { name: 'Polimento', description: 'Polimento para remoção de riscos e brilho.', price: 120, duration: 240 },
  { name: 'Vitrificacao', description: 'Aplicação de vitrificador para proteção de pintura.', price: 120, duration: 480 },
  { name: 'Nano Protecao', description: 'Aplicação de nano proteção para repelência.', price: 120, duration: 120 },
  { name: 'Descontaminacao de Vidros', description: 'Remoção de manchas e contaminantes dos vidros.', price: 120, duration: 60 },
  { name: 'Cristalizacao de Farol', description: 'Restauração e proteção de faróis amarelados.', price: 120, duration: 90 },
];

const seedDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI não encontrada no .env!');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Conectado ao MongoDB para seeding...');

    for (const serviceData of servicesToSeed) {
      const existingService = await Service.findOne({ name: serviceData.name });
      if (!existingService) {
        await Service.create(serviceData);
        console.log(`Serviço '${serviceData.name}' criado.`);
      } else {
        console.log(`Serviço '${serviceData.name}' já existe. Pulando.`);
      }
    }

    console.log('Seeding de serviços concluído!');

  } catch (error) {
    console.error('Erro durante o seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
};

seedDB();
