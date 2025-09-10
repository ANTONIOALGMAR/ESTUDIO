import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaCar, FaSoap, FaChair, FaHandHoldingWater, FaPaintRoller, FaShieldAlt, FaMagic, FaWindowMaximize, FaLightbulb } from 'react-icons/fa';

const services = [
  {
    title: 'Lavagem Básica',
    description: 'Uma limpeza cuidadosa para o dia a dia, removendo a sujeira superficial e mantendo seu carro com boa aparência.',
    icon: <FaCar size={40} />
  },
  {
    title: 'Lavagem Técnica',
    description: 'Processo detalhado que limpa profundamente a pintura, rodas e chassis, preparando para outros serviços.',
    icon: <FaSoap size={40} />
  },
  {
    title: 'Higienização de Tecido/Couro',
    description: 'Limpeza profunda e especializada para estofados de tecido ou couro, removendo manchas, odores e ácaros.',
    icon: <FaChair size={40} />
  },
  {
    title: 'Hidratação de Couro',
    description: 'Tratamento que nutre e protege os bancos e acabamentos em couro, prevenindo rachaduras e o ressecamento.',
    icon: <FaHandHoldingWater size={40} />
  },
  {
    title: 'Polimento',
    description: 'Técnica para remover micro-riscos, oxidação e imperfeições, restaurando o brilho e a lisura da pintura.',
    icon: <FaPaintRoller size={40} />
  },
  {
    title: 'Vitrificação',
    description: 'Aplicação de um composto de alta dureza que cria uma camada de vidro protetora sobre a pintura, com brilho e durabilidade extremos.',
    icon: <FaShieldAlt size={40} />
  },
  {
    title: 'Nano Proteção',
    description: 'Tecnologia avançada que cria uma barreira invisível e repelente a líquidos e sujeira para a pintura e vidros.',
    icon: <FaMagic size={40} />
  },
  {
    title: 'Descontaminação de Vidros',
    description: 'Remoção de manchas d\'água, chuva ácida e outras contaminações dos vidros, melhorando a visibilidade e a segurança.',
    icon: <FaWindowMaximize size={40} />
  },
  {
    title: 'Cristalização de Farol',
    description: 'Processo de polimento e proteção que restaura a transparência e a eficiência dos faróis amarelados ou opacos.',
    icon: <FaLightbulb size={40} />
  }
];

const Services = () => {
  return (
    <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <h2 className="text-center mb-5">Nossos Serviços</h2>
      <Row>
        {services.map((service, index) => (
          <Col xs={12} sm={12} md={6} lg={4} className="mb-4" key={index}>
            <Card className="h-100 text-center" bg="dark" text="white">
              <Card.Body>
                <div className="mb-3">{service.icon}</div>
                <Card.Title>{service.title}</Card.Title>
                <Card.Text>{service.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Services;
