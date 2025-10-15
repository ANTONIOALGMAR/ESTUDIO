import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/images/logo2.png';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isInitialLoading } = useAuth();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    logout(); // Chama a função de logout do AuthContext
    handleCloseNavMenu();
    navigate('/');
  };

  const commonPages = [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/about' },
    { name: 'Serviços', path: '/services' },
    { name: 'Agendamento', path: '/booking' },
  ];

  const renderNavLinks = (isMobile: boolean) => {
    const links = [...commonPages];

    if (user && user.userType === 'admin') {
      links.push({ name: 'Painel Admin', path: '/dashboard' });
    } else if (user && user.userType === 'customer') {
      links.push({ name: 'Painel Cliente', path: '/customer/dashboard' });
    }

    return links.map((page) => (
      isMobile ?
        <MenuItem key={page.name} component={Link} to={page.path} onClick={handleCloseNavMenu}>
          {page.name}
        </MenuItem>
      :
        <Button key={page.name} component={Link} to={page.path} sx={{ color: 'yellow', my: 2, display: 'block' }}>
          {page.name}
        </Button>
    ));
  };

  const renderAuthButtons = (isMobile: boolean) => {
    if (isInitialLoading) {
      return null; // Não renderiza nada enquanto o estado inicial está carregando
    }

    if (user && user.userType === 'admin') {
      if (isMobile) {
        return <MenuItem onClick={() => { handleLogout(); handleCloseNavMenu(); }} sx={{ color: 'yellow' }}>Sair Admin</MenuItem>;
      }
      return <Button onClick={handleLogout} sx={{ color: 'yellow' }}>Sair Admin</Button>;
    }
    
    if (user && user.userType === 'customer') {
      if (isMobile) {
        return <MenuItem onClick={() => { handleLogout(); handleCloseNavMenu(); }} sx={{ color: 'yellow' }}>Sair Cliente</MenuItem>;
      }
      return <Button onClick={handleLogout} sx={{ color: 'yellow' }}>Sair Cliente</Button>;
    }

    // Not authenticated
    if (isMobile) {
      return (
        <>
          <MenuItem onClick={handleCloseNavMenu} component={Link} to="/login" sx={{ color: 'yellow' }}>Login</MenuItem>
          <MenuItem onClick={handleCloseNavMenu} component={Link} to="/customer/register" sx={{ color: 'yellow' }}>Cadastro Cliente</MenuItem>
        </>
      );
    }
    
    return (
      <>
        <Button component={Link} to="/login" sx={{ color: 'yellow' }}>Login</Button>
        <Button component={Link} to="/customer/register" sx={{ color: 'yellow' }}>Cadastro Cliente</Button>
      </>
    );
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#212529', borderBottom: '2px solid yellow' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* --- Desktop Logo --- */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'yellow',
              textDecoration: 'none',
            }}
          >
            <img src={logo} height="40" alt="logo" style={{ marginRight: '10px' }} />
            Studio Carvalho
          </Typography>

          {/* --- Mobile Menu --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {renderNavLinks(true)}
              {renderAuthButtons(true)}
            </Menu>
          </Box>

          {/* --- Mobile Logo --- */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              alignItems: 'center',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'yellow',
              textDecoration: 'none',
            }}
          >
            <img src={logo} height="30" alt="logo" style={{ marginRight: '8px' }} />
            Studio Carvalho
          </Typography>

          {/* --- Desktop Links --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {renderNavLinks(false)}
            {renderAuthButtons(false)}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;