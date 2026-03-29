import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { authAPI } from '../../services/api';

const OTPModal = ({ show, authData, onVerified, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && show) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, show]);

  useEffect(() => {
    if (show) {
      setTimer(300); // 5 minutes
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [show]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({ 
        email: authData.user.email, 
        otp: otpString 
      });
      
      // OTP verification successful, complete the login
      onVerified(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimer(300);
    setCanResend(false);

    try {
      await authAPI.resendOTP(authData.user.email);
      // You might want to show a success message
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Verify Your Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">
          We've sent a 6-digit verification code to <strong>{authData?.user?.email}</strong>. 
          Please enter it below to complete your registration.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="text-center mb-4">
          <Row className="justify-content-center">
            {otp.map((digit, index) => (
              <Col xs="auto" key={index}>
                <Form.Control
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="text-center otp-input"
                  style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
                  disabled={loading}
                />
              </Col>
            ))}
          </Row>
        </div>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-muted">
              Code expires in: <strong>{formatTime(timer)}</strong>
            </p>
          ) : (
            <Button 
              variant="link" 
              onClick={handleResendOTP} 
              className="p-0"
              disabled={!canResend}
            >
              Resend verification code
            </Button>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OTPModal;