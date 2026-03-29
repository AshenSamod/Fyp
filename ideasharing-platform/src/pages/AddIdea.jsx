import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowLeft, FaRocket, FaMagic } from 'react-icons/fa';
import { useAuth } from '../utils/authContext';
import RichTextEditor from '../components/idea/RichTextEditor';
import { ideasAPI } from '../services/api';
import '../styles/AddIdea.css';

const AddIdea = () => {
  // const { user } = useAuth(); // Not currently used
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Check validation
    if (form.checkValidity() === false || !formData.description.trim() || !agreedToTerms) {
      e.stopPropagation();
      setValidated(true);
      if (!formData.description.trim()) {
        setError('Description is required');
      } else if (!agreedToTerms) {
        setError('You must agree to the terms before publishing your idea.');
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ideasAPI.create({
        title: formData.title,
        description: formData.description
      });

      console.log('Idea creation response:', response.data);

      // Navigate to the newly created idea
      // The API returns the idea nested in response.data.idea
      const ideaId = response.data.idea?.id || response.data.id;
      navigate(`/ideas/${ideaId}`);
    } catch (err) {
      console.error('Error creating idea:', err);
      setError(err.response?.data?.error || 'Failed to create idea. Please try again.');
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
    if (error) setError('');
  };

  const handleDescriptionChange = (content) => {
    setFormData({ ...formData, description: content });
    if (error) setError('');
  };

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button
        variant="link"
        className="back-link text-muted p-0 mb-3"
        onClick={() => navigate('/dashboard')}
      >
        <FaArrowLeft className="me-2" />
        Back to Dashboard
      </Button>

      {/* Page Header */}
      <div className="page-header mb-4 text-center">
        <h2 className="d-flex align-items-center justify-content-center mb-2">
          <FaLightbulb className="text-warning me-2" size={32} />
          Share Your Innovative Idea
        </h2>
      </div>
      
      {/* Form Card */}
      <Card className="idea-form-card shadow border-0">
        <Card.Header className="bg-primary text-white py-3">
          <h5 className="mb-0 d-flex align-items-center">
            <FaLightbulb className="me-2" />
            Transform your vision into reality. Showcase your idea to the community.
          </h5>
        </Card.Header>
        <Card.Body className="p-4 p-md-5">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
              {/* Title Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Idea Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter a catchy title for your idea"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  maxLength={200}
                  disabled={loading}
                  className="idea-title-input"
                />
                <Form.Text className="text-muted">
                  {formData.title.length}/200 characters
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  Please provide a title for your idea.
                </Form.Control.Feedback>
              </Form.Group>

              {/* Description Field with Rich Text Editor */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your idea in detail. Use formatting tools to make it clear and engaging..."
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Use the toolbar to format your description with bold, italic, lists, and more.
                </Form.Text>
                {validated && !formData.description.trim() && (
                  <div className="text-danger small mt-1">
                    Please provide a description for your idea.
                  </div>
                )}
              </Form.Group>

              {/* IP Protection Agreement Checkbox */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="ip-agreement"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  label={
                    <span>
                      I understand that my idea will be public and IP protection is not available in this version.
                    </span>
                  }
                  required
                />
              </Form.Group>

              {/* Info Alert */}
              <Alert variant="light" className="mb-4 border-start border-4 border-info">
                <div className="d-flex align-items-start">
                  <FaMagic className="text-info me-3 mt-1" />
                  <div>
                    <strong className="d-block mb-1">AI-Powered Categorization</strong>
                    <small className="text-muted">
                      Your idea will be automatically categorized by our intelligent system based on the title and description you provide. This helps others discover your idea more easily!
                    </small>
                  </div>
                </div>
              </Alert>

              {/* Action Buttons */}
              <div className="d-flex gap-2 gap-md-3 justify-content-end flex-wrap">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                  className="px-4"
                >
                  <FaArrowLeft className="me-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="d-flex align-items-center gap-2 px-4 shadow-sm"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Creating Your Idea...</span>
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      <span>Publish Idea</span>
                    </>
                  )}
                </Button>
              </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddIdea;
