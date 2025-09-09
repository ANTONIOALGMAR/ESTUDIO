
import React from 'react';
import { Container } from 'react-bootstrap';

const About = () => {
  return (
    <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <h2>Sobre Nós</h2>
      <p>
        Há 9 anos, a Studioo Carvalho nascia de uma paixão por carros e o desejo de oferecer um serviço de estética automotiva sem igual em nossa comunidade. Hoje, somos referência em Jd. das Oliveiras, Itapecerica da Serra, e nosso compromisso inicial permanece mais forte do que nunca: a satisfação total de cada cliente que nos confia seu veículo.
      </p>
      <p>
        Nossa missão é entregar um resultado que supera expectativas. Para isso, aliamos tecnologia, os melhores produtos do mercado e as práticas mais avançadas em detalhamento automotivo. Cada polimento, cada cristalização e cada lavagem é executada com a máxima precisão, garantindo o cuidado que seu veículo merece.
      </p>
      <p>
        Para sua maior comodidade, expandimos nosso atendimento e agora contamos com duas unidades prontas para recebê-lo:
        <ul>
          <li><strong>Posto 1:</strong> Rua Zila Ferreira da Silva, n. 52</li>
          <li><strong>Posto 2:</strong> Rua Crispim Rodrigues de Andrade, 267</li>
        </ul>
      </p>
      <p>
        Sabemos que a rotina é corrida, por isso oferecemos o serviço de <strong>Leva e Trás</strong>. Cuidamos do seu carro enquanto você cuida dos seus compromissos.
      </p>
      <p>
        Quer ver nosso trabalho de perto ou tirar alguma dúvida? Siga-nos em nossas redes sociais! Será um prazer conectar com você.
      </p>
    </Container>
  );
}

export default About;
