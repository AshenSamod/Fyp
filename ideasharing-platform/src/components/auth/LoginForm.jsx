import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { authAPI } from '../../services/api';

const LoginForm = ({ onAuthSuccess, onError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      });
      
      const authData = response.data;
      
      // Check if OTP verification is required (you might have a flag in response)
      const requiresOTP = response.data.requires_otp || false;
      
      if (requiresOTP) {
        onAuthSuccess(authData, true);
      } else {
        onAuthSuccess(authData, false);
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold text-secondary small">
          <FaEnvelope className="me-2" />Email Address
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text className="bg-white border-end-0">
            <FaEnvelope className="text-primary" />
          </InputGroup.Text>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            isInvalid={!!errors.email}
            required
            className="border-start-0 py-2"
            style={{ fontSize: '0.95rem' }}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold text-secondary small">
          <FaLock className="me-2" />Password
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text className="bg-white border-end-0">
            <FaLock className="text-primary" />
          </InputGroup.Text>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            isInvalid={!!errors.password}
            required
            className="border-start-0 border-end-0 py-2"
            style={{ fontSize: '0.95rem' }}
          />
          <InputGroup.Text 
            className="bg-white border-start-0"
            style={{ cursor: 'pointer' }}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash className="text-secondary" /> : <FaEye className="text-secondary" />}
          </InputGroup.Text>
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        className="w-100 py-3 fw-semibold shadow-sm"
        disabled={loading}
        style={{
          fontSize: '1rem',
          borderRadius: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Signing you in...
          </>
        ) : (
          <>
            <FaSignInAlt className="me-2" />
            Sign In
          </>
        )}
      </Button>
    </Form>
  );
};

export default LoginForm;