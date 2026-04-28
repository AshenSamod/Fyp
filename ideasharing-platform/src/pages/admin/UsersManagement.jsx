import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Button, Badge, Spinner, Alert, Form, InputGroup, Pagination, Modal } from 'react-bootstrap';
import { FaUsers, FaSearch, FaCheckCircle, FaBan, FaUserShield, FaUser, FaClock } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../utils/authContext';
import { useNavigate } from 'react-router-dom';

const UsersManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'enable' or 'disable'
  const [actionLoading, setActionLoading] = useState(false);
  const perPage = 50;

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (search.trim()) {
        // Use search endpoint
        response = await adminAPI.searchUsers({
          q: search,
          page: currentPage,
          per_page: perPage
        });
      } else {
        // Use regular list endpoint
        response = await adminAPI.getUsers({
          page: currentPage,
          per_page: perPage
        });
      }

      const userData = response.data.users || [];
      setUsers(userData);
      setTotalUsers(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch users when page changes
  useEffect(() => {
    if (user && user.is_admin) {
      fetchUsers(searchTerm);
    }
  }, [currentPage, user, fetchUsers, searchTerm]);

  // Handle search with debouncing - but don't trigger on page change
  useEffect(() => {
    if (!user || !user.is_admin) return;
    if (!searchTerm) return; // Don't debounce empty search

    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page on new search
      } else {
        fetchUsers(searchTerm); // Already on page 1, just fetch
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActionClick = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      if (actionType === 'enable') {
        await adminAPI.enableUser(selectedUser.id);
      } else {
        await adminAPI.disableUser(selectedUser.id);
      }
      
      setShowConfirmModal(false);
      setSelectedUser(null);
      setActionType('');
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error(`Error ${actionType}ing user:`, err);
      alert(err.response?.data?.error || `Failed to ${actionType} user. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionCancel = () => {
    setShowConfirmModal(false);
    setSelectedUser(null);
    setActionType('');
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
            <FaUsers className="me-2 text-warning" />
            Users Management
          </h2>
          <p className="text-muted mb-0">Manage platform users and their access</p>
        </div>
        <div className="text-end">
          <h5 className="mb-0 text-primary">{totalUsers}</h5>
          <small className="text-muted">Total Users</small>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <Form>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            {searchTerm && (
              <small className="text-muted d-block mt-2">
                Searching for "{searchTerm}" - {totalUsers} result{totalUsers !== 1 ? 's' : ''} found
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

      {/* Users Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <FaUsers className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
              <p className="text-muted">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="align-middle">
                        <strong>#{u.id}</strong>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white me-2"
                            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                          >
                            {u.is_admin ? <FaUserShield /> : <FaUser />}
                          </div>
                          <strong>{u.full_name}</strong>
                        </div>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">{u.email}</small>
                      </td>
                      <td className="align-middle">
                        {u.is_admin ? (
                          <Badge bg="warning" text="dark">
                            <FaUserShield className="me-1" />
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge bg="secondary">
                            <FaUser className="me-1" />
                            USER
                          </Badge>
                        )}
                      </td>
                      <td className="align-middle">
                        {u.is_active === false ? (
                          <Badge bg="danger">
                            <FaBan className="me-1" />
                            Disabled
                          </Badge>
                        ) : (
                          <Badge bg="success">
                            <FaCheckCircle className="me-1" />
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {formatDate(u.created_at)}
                        </small>
                      </td>
                      <td className="align-middle text-center">
                        {u.id !== user.id && (
                          <>
                            {u.is_active === false ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleActionClick(u, 'enable')}
                                title="Enable User"
                              >
                                <FaCheckCircle className="me-1" />
                                Enable
                              </Button>
                            ) : (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleActionClick(u, 'disable')}
                                title="Disable User"
                              >
                                <FaBan className="me-1" />
                                Disable
                              </Button>
                            )}
                          </>
                        )}
                        {u.id === user.id && (
                          <Badge bg="info" text="white">You</Badge>
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
              <Pagination>
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first, last, current, and adjacent pages
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleActionCancel} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className={`d-flex align-items-center h6 ${actionType === 'enable' ? 'text-success' : 'text-danger'}`}>
            {actionType === 'enable' ? <FaCheckCircle className="me-2" /> : <FaBan className="me-2" />}
            {actionType === 'enable' ? 'Enable User' : 'Disable User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="mb-2">
            Are you sure you want to {actionType} this user?
          </p>
          {selectedUser && (
            <div className="bg-light p-3 rounded">
              <div className="d-flex align-items-center mb-2">
                <div 
                  className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white me-2"
                  style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                >
                  {selectedUser.is_admin ? <FaUserShield /> : <FaUser />}
                </div>
                <div>
                  <strong className="d-block">{selectedUser.full_name}</strong>
                  <small className="text-muted">{selectedUser.email}</small>
                </div>
              </div>
            </div>
          )}
          {actionType === 'disable' && (
            <p className="text-danger small mt-3 mb-0">
              <strong>Warning:</strong> This user will not be able to access the platform until re-enabled.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleActionCancel}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant={actionType === 'enable' ? 'success' : 'danger'}
            size="sm"
            onClick={handleActionConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {actionType === 'enable' ? 'Enabling...' : 'Disabling...'}
              </>
            ) : (
              <>
                {actionType === 'enable' ? <FaCheckCircle className="me-1" /> : <FaBan className="me-1" />}
                {actionType === 'enable' ? 'Enable' : 'Disable'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersManagement;
