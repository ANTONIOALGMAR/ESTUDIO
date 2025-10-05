import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  DirectionsCar,
  LocalCarWash,
  Chair,
  WaterDrop,
  Brush,
  Shield,
  AutoAwesome,
  CropSquare,
  Lightbulb
} from '@mui/icons-material';

const services = [
  {
    title: 'Lavagem Básica',
    description: 'Uma limpeza cuidadosa para o dia a dia, removendo a sujeira superficial e mantendo seu carro com boa aparência.',
    icon: <DirectionsCar sx={{ fontSize: 40 }} />
  },
  {
    title: 'Lavagem Técnica',
    description: 'Processo detalhado que limpa profundamente a pintura, rodas e chassis, preparando para outros serviços.',
    icon: <LocalCarWash sx={{ fontSize: 40 }} />
  },
  {
    title: 'Higienização de Tecido/Couro',
    description: 'Limpeza profunda e especializada para estofados de tecido ou couro, removendo manchas, odores e ácaros.',
    icon: <Chair sx={{ fontSize: 40 }} />
  },
  {
    title: 'Hidratação de Couro',
    description: 'Tratamento que nutre e protege os bancos e acabamentos em couro, prevenindo rachaduras e o ressecamento.',
    icon: <WaterDrop sx={{ fontSize: 40 }} />
  },
  {
    title: 'Polimento',
    description: 'Técnica para remover micro-riscos, oxidação e imperfeições, restaurando o brilho e a lisura da pintura.',
    icon: <Brush sx={{ fontSize: 40 }} />
  },
  {
    title: 'Vitrificação',
    description: 'Aplicação de um composto de alta dureza que cria uma camada de vidro protetora sobre a pintura, com brilho e durabilidade extremos.',
    icon: <Shield sx={{ fontSize: 40 }} />
  },
  {
    title: 'Nano Proteção',
    description: 'Tecnologia avançada que cria uma barreira invisível e repelente a líquidos e sujeira para a pintura e vidros.',
    icon: <AutoAwesome sx={{ fontSize: 40 }} />
  },
  {
    title: 'Descontaminação de Vidros',
    description: 'Remoção de manchas d\'água, chuva ácida e outras contaminações dos vidros, melhorando a visibilidade e a segurança.',
    icon: <CropSquare sx={{ fontSize: 40 }} />
  },
  {
    title: 'Cristalização de Farol',
    description: 'Processo de polimento e proteção que restaura a transparência e a eficiência dos faróis amarelados ou opacos.',
    icon: <Lightbulb sx={{ fontSize: 40 }} />
  }
];

const Services = () => {
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center" fontWeight="bold">
        Nossos Serviços
      </Typography>
      <Grid container spacing={4} sx={{ mt: 3 }}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', bgcolor: '#212529', color: 'white', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Box sx={{ mb: 2, color: 'primary.main' }}>{service.icon}</Box>
                <Typography variant="h5" component="div" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Services;
