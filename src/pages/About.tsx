import React from 'react';
import { Container, Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const About = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, py: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Sobre Nós
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Há 9 anos, a Studioo Carvalho nascia de uma paixão por carros e o desejo de oferecer um serviço de estética automotiva sem igual em nossa comunidade. Hoje, somos referência em Jd. das Oliveiras, Itapecerica da Serra, e nosso compromisso inicial permanece mais forte do que nunca: a satisfação total de cada cliente que nos confia seu veículo.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Nossa missão é entregar um resultado que supera expectativas. Para isso, aliamos tecnologia, os melhores produtos do mercado e as práticas mais avançadas em detalhamento automotivo. Cada polimento, cada cristalização e cada lavagem é executada com a máxima precisão, garantindo o cuidado que seu veículo merece.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Nossas Unidades
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Para sua maior comodidade, expandimos nosso atendimento e agora contamos com duas unidades prontas para recebê-lo:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <LocationOnIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Posto 1" secondary="Rua Zila Ferreira da Silva, n. 52" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationOnIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Posto 2" secondary="Rua Crispim Rodrigues de Andrade, 267" />
          </ListItem>
        </List>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Serviço Leva e Trás
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
          Sabemos que a rotina é corrida, por isso oferecemos o serviço de <Typography component="span" fontWeight="bold">Leva e Trás</Typography>. Cuidamos do seu carro enquanto você cuida dos seus compromissos.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mt: 4, textAlign: 'center' }}>
          Quer ver nosso trabalho de perto ou tirar alguma dúvida? Siga-nos em nossas redes sociais! Será um prazer conectar com você.
        </Typography>
      </Box>
    </Container>
  );
}

export default About;
