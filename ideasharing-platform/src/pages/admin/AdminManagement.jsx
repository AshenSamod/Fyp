import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup, Pagination, Modal } from 'react-bootstrap';
import { FaUserShield, FaSearch, FaUser, FaClock, FaPlus, FaTimes, FaUserMinus } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../utils/authContext';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Add admin modal
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  
  const perPage = 50;

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchAdmins = useCallback(async (search = '') => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (search.trim()) {
        // Use search endpoint with type=admins
        response = await adminAPI.searchAdmins({
          q: search,
          page: currentPage,
          per_page: perPage
        });
      } else {
        // Use regular list endpoint with type=admins
        response = await adminAPI.getAdmins({
          page: currentPage,
          per_page: perPage
        });
      }

      const adminData = response.data.users || [];
      setAdmins(adminData);
      setTotalAdmins(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
      
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err.response?.data?.error || 'Failed to load admins. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch admins when page changes
  useEffect(() => {
    if (user && user.is_admin) {
      fetchAdmins(searchTerm);
    }
  }, [currentPage, user, fetchAdmins, searchTerm]);

  // Handle search with debouncing - but don't trigger on page change
  useEffect(() => {
    if (!user || !user.is_admin) return;
    if (!searchTerm) return; // Don't debounce empty search

    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page on new search
      } else {
        fetchAdmins(searchTerm); // Already on page 1, just fetch
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveAdminClick = (admin) => {
    setSelectedAdmin(admin);
    setShowRemoveModal(true);
  };

  const handleRemoveAdminConfirm = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await adminAPI.removeAdmin(selectedAdmin.id);
      setShowRemoveModal(false);
      setSelectedAdmin(null);
      await fetchAdmins(searchTerm);
    } catch (err) {
      console.error('Error removing admin:', err);
      alert(err.response?.data?.error || 'Failed to remove admin privileges. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdminCancel = () => {
    setShowRemoveModal(false);
    setSelectedAdmin(null);
  };

  // Add admin functionality
  const handleAddAdminClick = () => {
    setShowAddAdminModal(true);
    setUserSearchTerm('');
    setSearchResults([]);
  };

  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await adminAPI.searchUsers({
        q: query,
        page: 1,
        per_page: 20
      });
      setSearchResults(response.data.users || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(userSearchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, searchUsers]);

  const handleMakeAdmin = async (userId) => {
    setAddingAdmin(true);
    try {
      await adminAPI.makeAdmin(userId);
      setShowAddAdminModal(false);
      setUserSearchTerm('');
      setSearchResults([]);
      await fetchAdmins(searchTerm);
    } catch (err) {
      console.error('Error making user admin:', err);
      alert(err.response?.data?.error || 'Failed to grant admin privileges. Please try again.');
    } finally {
      setAddingAdmin(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaUserShield className="me-2 text-warning" />
            Admin Management
          </h2>
          <p className="text-muted mb-0">Manage admin users and permissions</p>
        </div>
        <div className="text-end">
          <h5 className="mb-0">{totalAdmins}</h5>
          <small className="text-muted">Total Admins</small>
        </div>
      </div>

      {/* Add Admin Button */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="p-3">
          <Button 
            variant="success" 
            size="sm"
            onClick={handleAddAdminClick}
          >
            <FaPlus className="me-2" />
            Add Admin
          </Button>
        </Card.Body>
      </Card>

      {/* Search */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="p-3">
          <Form>
            <InputGroup size="sm">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search admins by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            {searchTerm && (
              <small className="text-muted d-block mt-2">
                Searching for "{searchTerm}" - {totalAdmins} result{totalAdmins !== 1 ? 's' : ''} found
              </small>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Admins Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-5">
              <FaUserShield className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
              <p className="text-muted">
                {searchTerm ? 'No admins found matching your search.' : 'No admins found.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="text-center">Status</th>
                    <th>Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="align-middle">
                        <strong>#{admin.id}</strong>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-warning bg-gradient d-flex align-items-center justify-content-center text-dark me-2"
                            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                          >
                            <FaUserShield />
                          </div>
                          <strong>{admin.full_name}</strong>
                        </div>
                      </td>
                      <td className="align-middle">{admin.email}</td>
                      <td className="text-center align-middle">
                        {admin.is_active ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="danger">Disabled</Badge>
                        )}
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {formatDate(admin.created_at)}
                        </small>
                      </td>
                      <td className="text-center align-middle">
                        {admin.id !== user.id ? (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveAdminClick(admin)}
                          >
                            <FaUserMinus className="me-1" />
                            Remove Admin
                          </Button>
                        ) : (
                          <small className="text-muted">You</small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="bg-white border-top">
            <div className="d-flex justify-content-center">
              <Pagination size="sm">
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === currentPage}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  } else if (Math.abs(pageNum - currentPage) === 2) {
                    return <Pagination.Ellipsis key={pageNum} disabled />;
                  }
                  return null;
                })}
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Remove Admin Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={handleRemoveAdminCancel} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-warning d-flex align-items-center h6">
            <FaUserMinus className="me-2" />
            Remove Admin Privileges
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Alert variant="warning" className="mb-3">
            <strong>Warning:</strong> This will remove admin privileges from this user.
          </Alert>
          {selectedAdmin && (
            <div className="bg-light p-3 rounded">
              <p className="mb-1"><strong>Name:</strong> {selectedAdmin.full_name}</p>
              <p className="mb-0"><strong>Email:</strong> {selectedAdmin.email}</p>
            </div>
          )}
          <p className="mt-3 mb-0 small">
            Are you sure you want to remove admin privileges from this user?
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleRemoveAdminCancel}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleRemoveAdminConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Removing...
              </>
            ) : (
              <>
                <FaUserMinus className="me-2" />
                Remove Admin
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Admin Modal */}
      <Modal show={showAddAdminModal} onHide={() => setShowAddAdminModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-success d-flex align-items-center h6">
            <FaPlus className="me-2" />
            Add Admin
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Search for a user</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {searchingUsers && (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="primary" />
              <p className="small text-muted mt-2 mb-0">Searching users...</p>
            </div>
          )}

          {!searchingUsers && userSearchTerm && searchResults.length === 0 && (
            <Alert variant="info" className="small mb-0">
              No users found matching your search.
            </Alert>
          )}

          {searchResults.length > 0 && (
            <div className="border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead className="bg-light sticky-top">
                  <tr>
                    <th className="small">User</th>
                    <th className="text-center small">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((searchUser) => (
                    <tr key={searchUser.id}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white me-2"
                            style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}
                          >
                            <FaUser />
                          </div>
                          <div>
                            <div className="small fw-bold">{searchUser.full_name}</div>
                            <div className="small text-muted">{searchUser.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMakeAdmin(searchUser.id)}
                          disabled={addingAdmin}
                        >
                          {addingAdmin ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <FaUserShield className="me-1" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAddAdminModal(false)}
          >
            <FaTimes className="me-2" />
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminManagement;
