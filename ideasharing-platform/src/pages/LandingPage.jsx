import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaLightbulb, FaUsers, FaComments, FaRocket, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleAuth = () => {
    navigate('/auth');
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes subtleGlow {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.4));
            }
            50% {
              filter: drop-shadow(0 0 20px rgba(255, 193, 7, 0.7));
            }
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
          
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.8s ease-out forwards;
          }
          
          .fade-in-delay {
            opacity: 0;
            animation: fadeIn 0.8s ease-out 0.3s forwards;
          }
          
          .bulb-glow {
            animation: subtleGlow 3s ease-in-out infinite;
          }
          
          .bounce {
            animation: bounce 2s ease-in-out infinite;
          }
          
          .feature-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;
          }
          
          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #4dabf7, #339af0);
            transform: scaleY(0);
            transition: transform 0.3s ease;
            transform-origin: top;
          }
          
          .feature-card:hover::before {
            transform: scaleY(1);
          }
          
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            border-color: #e0e0e0;
          }
          
          .hero-button {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .hero-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(13, 110, 253, 0.25);
          }
          
          .hero-button::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%);
            transform-origin: 50% 50%;
          }
          
          .hero-button:hover::after {
            animation: ripple 1s ease-out;
          }
          
          @keyframes ripple {
            0% {
              transform: scale(0, 0);
              opacity: 0.5;
            }
            100% {
              transform: scale(40, 40);
              opacity: 0;
            }
          }
          
          .section-divider {
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
            margin: 2rem 0;
          }
          
          .icon-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            transition: all 0.3s ease;
          }
          
          .feature-card:hover .icon-circle {
            transform: scale(1.1) rotate(5deg);
            background: linear-gradient(135deg, #e9ecef, #dee2e6);
          }
          
          .scroll-indicator {
            margin-top: 3rem;
            cursor: pointer;
          }
        `}
      </style>
      
      <div className="min-vh-100">
        {/* Hero Section */}
        <Container fluid className={`py-5 ${animate ? 'fade-in' : ''}`} 
          style={{ 
            backgroundColor: '#7ad8f546',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(76, 201, 240, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(130, 201, 30, 0.05) 0%, transparent 50%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center'
          }}>
          <Container>
            <Row className="justify-content-center align-items-center">
              <Col xs={12} md={10} lg={8} className="text-center">
                <div className="mb-4">
                  <div className="position-relative d-inline-block">
                    <FaLightbulb size={100} className="mb-4 bulb-glow" 
                      style={{ 
                        color: '#ffd700',
                        filter: 'drop-shadow(0 4px 8px rgba(20, 18, 6, 0))'
                      }} />
                    <div className="position-absolute top-0 start-100 translate-middle">
                      <div className="rounded-circle bg-primary" 
                        style={{ width: '24px', height: '24px', opacity: 0.8 }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-1">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">
                      Welcome to Innovation
                    </span>
                  </div>
                  
                  <h1 className="display-4 fw-bold mb-4" 
                    style={{ 
                      background: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                    Share Your Ideas
                  </h1>
                  
                  <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px', fontSize: '1.25rem' }}>
                    Connect with like-minded people, share innovative ideas, and build something amazing together.
                    Join our community of creators and innovators.
                  </p>
                  
                  <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAuth}
                      className="px-5 py-3 hero-button fw-semibold"
                      style={{ 
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                    >
                      Login / Register to Continue
                      <FaArrowRight className="ms-2" />
                    </Button>
                    
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                      className="px-5 py-3 fw-semibold"
                      style={{ 
                        borderRadius: '50px',
                        borderWidth: '2px'
                      }}
                    >
                      Explore Features
                    </Button>
                  </div>
                  
                  <div className="scroll-indicator bounce" 
                    onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                    <FaChevronDown size={24} className="text-muted" />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </Container>

        {/* Features Section */}
        <section id="features">
          <Container className={`py-5 ${animate ? 'fade-in-delay' : ''}`} style={{ backgroundColor: '#ffffff' }}>
            <Row className="text-center mb-5">
              <Col xs={12} className="mb-4">
                <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
                  Why Choose Our Platform?
                </h2>
                <p className="text-muted lead" style={{ fontSize: '1.1rem' }}>
                  Discover the features that make idea sharing effortless
                </p>
              </Col>
            </Row>
            
            <div className="section-divider"></div>
            
            <Row className="g-4">
              <Col xs={12} md={6} lg={3}>
                <Card className="h-100 border-0 feature-card">
                  <Card.Body className="p-4">
                    <div className="icon-circle">
                      <FaRocket className="text-primary" size={32} />
                    </div>
                    <h5 className="fw-bold mb-3 text-center">Innovate Together</h5>
                    <p className="text-muted text-center mb-0">
                      Collaborate on groundbreaking ideas and turn concepts into reality.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card className="h-100 border-0 feature-card">
                  <Card.Body className="p-4">
                    <div className="icon-circle">
                      <FaUsers className="text-primary" size={32} />
                    </div>
                    <h5 className="fw-bold mb-3 text-center">Build Community</h5>
                    <p className="text-muted text-center mb-0">
                      Connect with passionate individuals who share your vision.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card className="h-100 border-0 feature-card">
                  <Card.Body className="p-4">
                    <div className="icon-circle">
                      <FaComments className="text-primary" size={32} />
                    </div>
                    <h5 className="fw-bold mb-3 text-center">Engage in Discussions</h5>
                    <p className="text-muted text-center mb-0">
                      Share feedback, ask questions, and refine your ideas through conversation.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6} lg={3}>
                <Card className="h-100 border-0 feature-card">
                  <Card.Body className="p-4">
                    <div className="icon-circle">
                      <FaLightbulb className="text-primary" size={32} />
                    </div>
                    <h5 className="fw-bold mb-3 text-center">Spark Creativity</h5>
                    <p className="text-muted text-center mb-0">
                      Get inspired by diverse perspectives and innovative thinking.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <div className="section-divider"></div>
          </Container>
        </section>

        {/* Call to Action */}
        <Container fluid className="py-5" 
          style={{ 
            backgroundColor: '#0d6efd',
            backgroundImage: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)'
          }}>
          <Row className="justify-content-center text-center py-5">
            <Col xs={12} md={8} lg={6}>
              <h3 className="fw-bold mb-4 text-white" style={{ fontSize: '2rem' }}>
                Ready to Share Your Ideas?
              </h3>
              <p className="mb-4 text-white" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                Join thousands of innovators who are already sharing their visions.
                Start your journey today.
              </p>
              <Button
                variant="light"
                size="lg"
                onClick={handleAuth}
                className="px-5 py-3 fw-bold"
                style={{ 
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started Now
              </Button>
            </Col>
          </Row>
        </Container>

        {/* Footer */}
        <Container fluid className="py-4" 
          style={{ 
            backgroundColor: '#212529',
            backgroundImage: 'linear-gradient(135deg, #212529 0%, #343a40 100%)'
          }}>
          <Container>
            <Row className="justify-content-center text-center">
              <Col xs={12}>
                <p className="mb-0 text-white" style={{ opacity: 0.8 }}>
                  © 2025 Idea Sharing Platform. Built with passion for innovation.
                </p>

              </Col>
            </Row>
          </Container>
        </Container>
      </div>
    </>
  );
};

export default LandingPage;