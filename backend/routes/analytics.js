const router = require('express').Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const Booking = require('../models/Booking.model');
const Customer = require('../models/Customer.model');
const Service = require('../models/Service.model');

// ROTA DE ADMIN - Obter um resumo de analytics
router.get('/summary', verifyAdmin, async (req, res) => {
  try {
    // 1. Contagem total de clientes
    const totalCustomers = await Customer.countDocuments();

    // 2. Contagem total de agendamentos
    const totalBookings = await Booking.countDocuments();

    // 3. Calcular o faturamento total usando Aggregation Pipeline
    const revenuePipeline = [
      // Etapa 1: Filtrar apenas agendamentos 'entregues'
      { $match: { status: 'entregue' } },
      
      // Etapa 2: "Desenrolar" o array de serviços para processar cada um individualmente
      { $unwind: '$service' },

      // Etapa 3: Fazer um "join" com a coleção de serviços para obter os detalhes de cada serviço
      {
        $lookup: {
          from: 'services', // O nome da coleção de serviços no MongoDB
          localField: 'service',
          foreignField: 'name', // Assumindo que o array 'service' em Booking contém os nomes dos serviços
          as: 'serviceDetails'
        }
      },

      // Etapa 4: "Desenrolar" o resultado do lookup
      { $unwind: '$serviceDetails' },

      // Etapa 5: Agrupar tudo em um único resultado e somar os preços
      {
        $group: {
          _id: null, // Agrupa todos os documentos em um só
          totalRevenue: { $sum: '$serviceDetails.price' }
        }
      }
    ];

    const revenueResult = await Booking.aggregate(revenuePipeline);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Enviar o resumo
    res.json({
      totalCustomers,
      totalBookings,
      totalRevenue
    });

  } catch (err) {
    console.error("Erro ao gerar resumo de analytics:", err);
    res.status(500).json({ message: 'Erro ao gerar resumo de analytics.', error: err });
  }
});

module.exports = router;
