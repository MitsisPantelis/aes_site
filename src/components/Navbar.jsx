import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Container, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={Link} to="/" color="inherit">Home</Button>
            <Button component={Link} to="/decode" color="inherit">Decode</Button>
            <Button component={Link} to="/encode" color="inherit">Encode</Button>
            <Button component={Link} to="/step-by-step" color="inherit">StepByStep</Button>
            <Button component={Link} to="/incremental" color="inherit">Incremental</Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={Link} to="/" onClick={handleMenuClose}>Home</MenuItem>
              <MenuItem component={Link} to="/decode" onClick={handleMenuClose}>Decode</MenuItem>
              <MenuItem component={Link} to="/encode" onClick={handleMenuClose}>Encode</MenuItem>
              <MenuItem component={Link} to="/step-by-step" onClick={handleMenuClose}>StepByStep</MenuItem>
              <MenuItem component={Link} to="/incremental" onClick={handleMenuClose}>Incremental</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;