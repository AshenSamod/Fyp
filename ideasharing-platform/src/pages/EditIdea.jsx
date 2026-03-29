import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import RichTextEditor from '../components/idea/RichTextEditor';
import { ideasAPI } from '../services/api';
import { formatCategoryName } from '../utils/categoryUtils';
import '../styles/EditIdea.css';

const EditIdea = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fetchedRef = useRef(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const [originalIdea, setOriginalIdea] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch idea details and categories in parallel
        const [ideaResponse, categoriesResponse] = await Promise.all([
          ideasAPI.getById(id),
          ideasAPI.getCategories()
        ]);

        // Extract idea from response - API returns { idea: {...} }
        const idea = ideaResponse.data.idea || ideaResponse.data;
        setOriginalIdea(idea);
        
        // Extract category name if it's an object
        const categoryValue = typeof idea.category === 'object' && idea.category !== null
          ? idea.category.name
          : idea.category || '';
        
        setFormData({
          title: idea.title || '',
          description: idea.description || '',
          category: categoryValue
        });

        // Handle categories response - extract categories array
        const categoriesData = categoriesResponse.data;
        const categoryList = Array.isArray(categoriesData) 
          ? categoriesData 
          : (categoriesData?.categories || []);
        
        // Extract just the category names for the dropdown
        const categoryNames = categoryList.map(cat => cat.name);
        setCategories(categoryNames);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to load idea. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Check validation
    if (form.checkValidity() === false || !(formData.description || '').trim() || !agreedToTerms) {
      e.stopPropagation();
      setValidated(true);
      if (!(formData.description || '').trim()) {
        setError('Description is required');
      } else if (!agreedToTerms) {
        setError('You must agree to the terms before updating your idea.');
      }
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await ideasAPI.update(id, {
        title: formData.title,
        description: formData.description,
        category: formData.category
      });

      // Navigate back to idea detail page
      navigate(`/ideas/${id}`);
    } catch (err) {
      console.error('Error updating idea:', err);
      setError(err.response?.data?.error || 'Failed to update idea. Please try again.');
      setSubmitting(false);
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

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
    if (error) setError('');
  };

  // const toggleSidebar = () => {
  //   setShowSidebar(!showSidebar);
  // };

  // const toggleSidebarExpand = () => {
  //   setSidebarExpanded(!sidebarExpanded);
  // };

  if (loading) {
    return (
      <div className="edit-idea-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading idea...</p>
        </Container>
      </div>
    );
  }

  if (error && !originalIdea) {
    return (
      <div className="edit-idea-page">
        <Container className="py-5">
          <Alert variant="danger">
            {error}
            <div className="mt-3">
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

        {/* Main Content */}
        <main className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <Container className="py-4">
        <div className="page-header mb-4">
          <Button
            variant="link"
            className="back-button p-0 mb-3"
            onClick={() => navigate(`/ideas/${id}`)}
          >
            <FaArrowLeft /> Back to Idea
          </Button>
          <h2 className="page-title">
            <FaEdit className="me-2" />
            Edit Idea
          </h2>
          {originalIdea?.category && (
            <div className="mt-2">
              <small className="text-muted">Current Category: </small>
              <Badge bg="secondary" className="ms-1">
                {formatCategoryName(
                  typeof originalIdea.category === 'object' 
                    ? originalIdea.category.name 
                    : originalIdea.category
                )}
              </Badge>
            </div>
          )}
        </div>

        <Card className="idea-form-card">
          <Card.Body className="p-4">
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
                  value={formData.title || ''}
                  onChange={handleTitleChange}
                  required
                  maxLength={200}
                  disabled={submitting}
                  className="idea-title-input"
                />
                <Form.Text className="text-muted">
                  {(formData.title || '').length}/200 characters
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
                  value={formData.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your idea in detail. Use formatting tools to make it clear and engaging..."
                  disabled={submitting}
                />
                <Form.Text className="text-muted">
                  Use the toolbar to format your description with bold, italic, lists, and more.
                </Form.Text>
                {validated && !(formData.description || '').trim() && (
                  <div className="text-danger small mt-1">
                    Please provide a description for your idea.
                  </div>
                )}
              </Form.Group>

              {/* IP Protection Agreement Checkbox */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="ip-agreement-edit"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={submitting}
                  label={
                    <span>
                      I understand that my idea will be public and IP protection is not available in this version.
                    </span>
                  }
                  required
                />
              </Form.Group>

              {/* Category Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Category <span className="text-muted">(Optional)</span>
                </Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  disabled={submitting}
                  className="category-select"
                >
                  <option value="">Select a category (or keep AI-suggested)</option>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategoryName(cat)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  You can change the category or leave it as suggested by AI.
                </Form.Text>
              </Form.Group>

              {/* Info Alert */}
              <Alert variant="info" className="mb-4">
                <strong>Note:</strong> Changes to title and description may trigger re-categorization by our AI system.
              </Alert>

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/ideas/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting || !agreedToTerms}
                  className="d-flex align-items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      Update Idea
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
          </Container>
        </main>
      </div>
  );
};

export default EditIdea;
