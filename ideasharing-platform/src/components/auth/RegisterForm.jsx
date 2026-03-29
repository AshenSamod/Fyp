import React, { useState } from 'react';
import { Form, Button, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaLightbulb, FaDollarSign, FaChalkboardTeacher } from 'react-icons/fa';
import { authAPI } from '../../services/api';

const RegisterForm = ({ onAuthSuccess, onError }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'idea_creator'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
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
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name.trim(),
        role: formData.role
      });
      
      const authData = response.data;
      
      // Commented out OTP requirement - directly login after registration
      // For registration, assume OTP is always required
      // onAuthSuccess(authData, true);
      
      // Direct login without OTP verification
      onAuthSuccess(authData, false);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-secondary small">
              <FaUser className="me-2" />Full Name
            </Form.Label>
            <InputGroup className="shadow-sm">
              <InputGroup.Text className="bg-white border-end-0">
                <FaUser className="text-primary" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                isInvalid={!!errors.full_name}
                required
                className="border-start-0 py-2"
                style={{ fontSize: '0.95rem' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.full_name}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

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
        <Form.Label className="fw-semibold text-secondary small mb-3">
          Select Your Role <span className="text-danger">*</span>
        </Form.Label>
        <Row className="g-2">
          <Col xs={12}>
            <Card 
              className={`cursor-pointer transition-all ${
                formData.role === 'idea_creator' 
                  ? 'border-primary border-2 shadow-sm' 
                  : 'border-secondary-subtle'
              }`}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleChange({ target: { name: 'role', value: 'idea_creator' } })}
            >
              <Card.Body className="p-3">
                <Form.Check
                  type="radio"
                  id="role-idea-creator"
                  name="role"
                  value="idea_creator"
                  checked={formData.role === 'idea_creator'}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                  label={
                    <div className="d-flex align-items-start">
                      <FaLightbulb className="text-warning me-3 mt-1" size={20} />
                      <div>
                        <div className="fw-semibold text-dark">Idea Creator</div>
                        <small className="text-muted">Share and develop your innovative ideas</small>
                      </div>
                    </div>
                  }
                  className="mb-0"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12}>
            <Card 
              className={`cursor-pointer transition-all ${
                formData.role === 'investor' 
                  ? 'border-primary border-2 shadow-sm' 
                  : 'border-secondary-subtle'
              }`}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleChange({ target: { name: 'role', value: 'investor' } })}
            >
              <Card.Body className="p-3">
                <Form.Check
                  type="radio"
                  id="role-investor"
                  name="role"
                  value="investor"
                  checked={formData.role === 'investor'}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                  label={
                    <div className="d-flex align-items-start">
                      <FaDollarSign className="text-success me-3 mt-1" size={20} />
                      <div>
                        <div className="fw-semibold text-dark">Investor</div>
                        <small className="text-muted">Discover and support promising ideas</small>
                      </div>
                    </div>
                  }
                  className="mb-0"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12}>
            <Card 
              className={`cursor-pointer transition-all ${
                formData.role === 'mentor' 
                  ? 'border-primary border-2 shadow-sm' 
                  : 'border-secondary-subtle'
              }`}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleChange({ target: { name: 'role', value: 'mentor' } })}
            >
              <Card.Body className="p-3">
                <Form.Check
                  type="radio"
                  id="role-mentor"
                  name="role"
                  value="mentor"
                  checked={formData.role === 'mentor'}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                  label={
                    <div className="d-flex align-items-start">
                      <FaChalkboardTeacher className="text-info me-3 mt-1" size={20} />
                      <div>
                        <div className="fw-semibold text-dark">Mentor</div>
                        <small className="text-muted">Guide and advise idea creators</small>
                      </div>
                    </div>
                  }
                  className="mb-0"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {errors.role && (
          <div className="text-danger small mt-2">
            {errors.role}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
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
            placeholder="Min 6 characters"
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

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold text-secondary small">
          <FaLock className="me-2" />Confirm Password
        </Form.Label>
        <InputGroup className="shadow-sm">
          <InputGroup.Text className="bg-white border-end-0">
            <FaLock className="text-primary" />
          </InputGroup.Text>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            isInvalid={!!errors.confirmPassword}
            required
            className="border-start-0 border-end-0 py-2"
            style={{ fontSize: '0.95rem' }}
          />
          <InputGroup.Text 
            className="bg-white border-start-0"
            style={{ cursor: 'pointer' }}
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <FaEyeSlash className="text-secondary" /> : <FaEye className="text-secondary" />}
          </InputGroup.Text>
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
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
            Creating your account...
          </>
        ) : (
          <>
            <FaUser className="me-2" />
            Create Account
          </>
        )}
      </Button>
    </Form>
  );
};

export default RegisterForm;