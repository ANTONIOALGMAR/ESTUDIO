import React from 'react';
import { Box, Container, Typography, IconButton, Link } from '@mui/material';
import { Instagram, WhatsApp, Facebook, Phone } from '@mui/icons-material';

const Footer = () => {
  const socialLinks = [
    { icon: <Instagram />, href: 'https://www.instagram.com/studioo__carvalhoo/' },
    { icon: <WhatsApp />, href: 'https://wa.me/5511954989495' },
    { icon: <Facebook />, href: 'https://www.facebook.com/profile.php?id=61564202844778' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#212529',
        color: 'white',
        py: 3, // padding vertical
        mt: 'auto', // Empurra o rodapé para o final da página
        borderTop: '2px solid yellow',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Siga-nos nas redes sociais!
          </Typography>
          <Box sx={{ mb: 2 }}>
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'yellow', mx: 1.5 }} // margin horizontal
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
          <Link
            href="tel:+5511954989495"
            variant="body1"
            sx={{
              color: 'white',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              mb: 2,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <Phone sx={{ mr: 1 }} />
            (11) 95498-9495
          </Link>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            &copy; {new Date().getFullYear()} Carvalho Studio. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;