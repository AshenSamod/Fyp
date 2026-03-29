import React from 'react';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ showSidebar, onToggleSidebar }) => {
  return (
    <BSNavbar bg="white" className="border-bottom shadow-sm d-lg-none sticky-top">
      <Container fluid>
        <Button
          variant="outline-secondary"
          className="border-0 me-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {showSidebar ? <FaTimes size={20} /> : <FaBars size={20} />}
        </Button>
        
        <BSNavbar.Brand className="text-primary fw-bold mx-auto">
          IdeaSharing
        </BSNavbar.Brand>
        
        <div style={{ width: '40px' }}></div>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
