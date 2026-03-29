import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Spinner,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { categoriesAPI } from '../../services/api';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      await categoriesAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      setSuccess('Category added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.response?.data?.error || 'Failed to add category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      await categoriesAPI.update(selectedCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      setSuccess('Category updated successfully!');
      setShowEditModal(false);
      setFormData({ name: '', description: '' });
      setSelectedCategory(null);
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.error || 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setActionLoading(true);
    setError('');

    try {
      await categoriesAPI.delete(selectedCategory.id);
      
      setSuccess('Category deleted successfully!');
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
    setError('');
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (category.name || '').toLowerCase().includes(searchLower) ||
      (category.description || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container fluid className="py-3 py-lg-4 px-3 px-lg-4">
      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h3 className="text-primary fw-bold mb-2">
              <FaTags className="me-2" />
              Category Management
            </h3>
            <p className="text-muted mb-0">
              Manage idea categories for the platform
              {!loading && categories.length > 0 && (
                <span> ({categories.length} {categories.length === 1 ? 'category' : 'categories'})</span>
              )}
            </p>
          </div>
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2"
            onClick={openAddModal}
          >
            <FaPlus /> Add Category
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Search Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Categories Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-5">
              <FaTags className="text-muted mb-3" size={48} />
              <h5 className="text-muted mb-3">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h5>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term' 
                  : 'Create your first category to get started'}
              </p>
              {!searchTerm && (
                <Button 
                  variant="primary"
                  onClick={openAddModal}
                >
                  <FaPlus className="me-2" />
                  Add First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Ideas Count</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <Badge bg="primary" className="me-2">
                            <FaTags />
                          </Badge>
                          <span className="fw-semibold">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-muted">
                          {category.description || <em>No description</em>}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge bg="secondary">
                          {category.idea_count || 0}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            title="Edit category"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(category)}
                            title="Delete category"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={closeModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Category
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Category Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={actionLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={actionLoading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeModals}
              disabled={actionLoading}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={actionLoading || !formData.name.trim()}
            >
              {actionLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Adding...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Add Category
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={closeModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Category
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Category Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={actionLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={actionLoading}
              />
            </Form.Group>

            {selectedCategory?.idea_count > 0 && (
              <Alert variant="info" className="mb-0">
                <small>
                  This category is currently used by {selectedCategory.idea_count} {selectedCategory.idea_count === 1 ? 'idea' : 'ideas'}.
                </small>
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeModals}
              disabled={actionLoading}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={actionLoading || !formData.name.trim()}
            >
              {actionLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Update Category
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal show={showDeleteModal} onHide={closeModals} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Delete Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning!</strong> This action cannot be undone.
          </Alert>
          
          <p>
            Are you sure you want to delete the category <strong>"{selectedCategory?.name}"</strong>?
          </p>

          {selectedCategory?.idea_count > 0 && (
            <Alert variant="warning">
              <strong>Note:</strong> This category is currently used by {selectedCategory.idea_count} {selectedCategory.idea_count === 1 ? 'idea' : 'ideas'}. 
              Those ideas will be marked as uncategorized after deletion.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={closeModals}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCategory}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Yes, Delete Category
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoriesManagement;
