const router = require('express').Router();
const Service = require('../models/Service.model');
const verifyAdmin = require('../middleware/verifyAdmin');

// ROTA PÚBLICA - Listar todos os serviços ativos
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar serviços.', error: err });
  }
});

// ROTA DE ADMIN - Criar um novo serviço
router.post('/', verifyAdmin, async (req, res) => {
  const { name, description, price, duration } = req.body;

  const service = new Service({
    name,
    description,
    price,
    duration
  });

  try {
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar serviço.', error: err });
  }
});

// ROTA DE ADMIN - Atualizar um serviço
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Retorna o documento atualizado
    );
    if (!updatedService) return res.status(404).json({ message: 'Serviço não encontrado.' });
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar serviço.', error: err });
  }
});

// ROTA DE ADMIN - Deletar um serviço
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const removedService = await Service.findByIdAndDelete(req.params.id);
    if (!removedService) return res.status(404).json({ message: 'Serviço não encontrado.' });
    res.json({ message: 'Serviço deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar serviço.', error: err });
  }
});

module.exports = router;
