import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaLightbulb } from 'react-icons/fa';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import OTPModal from '../components/auth/OTPModal';
import { useAuth } from '../utils/authContext';

const Auth = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'danger') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleAuthSuccess = (authData, requiresOTP = false) => {
    if (requiresOTP) {
      // Store auth data and show OTP modal
      setPendingAuthData(authData);
      setShowOTPModal(true);
    } else {
      // Direct login without OTP
      completeLogin(authData);
    }
  };

  const completeLogin = (authData) => {
    const { access_token, refresh_token, user } = authData;
    
    // Use AuthContext login function
    login(access_token, refresh_token, user);
  };

  const handleOTPVerified = (authData) => {
    setShowOTPModal(false);
    setPendingAuthData(null);
    completeLogin(authData);
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
    setPendingAuthData(null);
  };

  return (
    <>
      <Container 
        fluid 
        className="min-vh-100 d-flex align-items-center py-4"
        style={{
          background: 'rgba(122, 216, 245, 0.275)'
        }}
      >
        <Row className="w-100 justify-content-center mx-0">
          <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
            <Card 
              className="shadow-lg border-0"
              style={{
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                    <FaLightbulb className="text-primary" size={40} />
                  </div>
                  <h2 className="fw-bold text-dark mb-2">IdeaSharing</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Transform your innovative ideas into reality
                  </p>
                </div>

                {alert.show && (
                  <Alert 
                    variant={alert.type} 
                    className="mb-4"
                    style={{
                      borderRadius: '10px',
                      border: 'none'
                    }}
                  >
                    {alert.message}
                  </Alert>
                )}

                <Tabs
                  activeKey={activeTab}
                  onSelect={(tab) => setActiveTab(tab)}
                  className="mb-4 nav-fill"
                  style={{
                    borderBottom: '2px solid #e9ecef'
                  }}
                >
                  <Tab 
                    eventKey="login" 
                    title={<span className="fw-semibold">Sign In</span>}
                    tabClassName="px-4"
                  >
                    <div className="pt-3">
                      <LoginForm 
                        onAuthSuccess={handleAuthSuccess}
                        onError={(message) => showAlert(message, 'danger')}
                      />
                    </div>
                  </Tab>
                  <Tab 
                    eventKey="register" 
                    title={<span className="fw-semibold">Create Account</span>}
                    tabClassName="px-4"
                  >
                    <div className="pt-3">
                      <RegisterForm 
                        onAuthSuccess={handleAuthSuccess}
                        onError={(message) => showAlert(message, 'danger')}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <small className="text-white">
                © 2026 IdeaSharing Platform. All rights reserved.
              </small>
            </div>
          </Col>
        </Row>
      </Container>

      <OTPModal
        show={showOTPModal}
        authData={pendingAuthData}
        onVerified={handleOTPVerified}
        onCancel={handleOTPCancel}
      />
    </>
  );
};

export default Auth;