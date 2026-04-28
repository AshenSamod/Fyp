import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Alert, Spinner, Table, Badge, Button, Form, Pagination, Collapse, Modal } from 'react-bootstrap';
import { FaClipboardList, FaFlag, FaChevronDown, FaChevronUp, FaEye, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const IdeasManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flaggedIdeas, setFlaggedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const perPage = 20;

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchFlaggedIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getFlaggedIdeas({
        page: currentPage,
        per_page: perPage,
        status: statusFilter
      });

      setFlaggedIdeas(response.data.flagged_ideas || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
      
    } catch (err) {
      console.error('Error fetching flagged ideas:', err);
      setError(err.response?.data?.error || 'Failed to load flagged ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchFlaggedIdeas();
    }
  }, [fetchFlaggedIdeas, user]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleUpdateStatus = (item, type) => {
    setSelectedItem({ ...item, type });
    setNewStatus('');
    setShowStatusModal(true);
  };

  const handleUpdateAllFlags = async () => {
    if (!selectedItem || !newStatus) return;

    setUpdating(true);
    try {
      if (selectedItem.type === 'all') {
        // Update all flags for this idea
        await adminAPI.updateAllFlagsForContent('idea', selectedItem.idea_id, newStatus);
      } else {
        // Update single flag
        await adminAPI.updateFlagStatus('idea', selectedItem.id, newStatus);
      }

      setShowStatusModal(false);
      setSelectedItem(null);
      setNewStatus('');
      await fetchFlaggedIdeas();
    } catch (err) {
      console.error('Error updating flag status:', err);
      alert(err.response?.data?.error || 'Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (idea) => {
    setIdeaToDelete(idea);
    setShowDeleteModal(true);
  };

  const handleDeleteIdea = async () => {
    if (!ideaToDelete) return;

    setDeleting(true);
    try {
      await adminAPI.deleteIdea(ideaToDelete.idea.id);
      setShowDeleteModal(false);
      setIdeaToDelete(null);
      await fetchFlaggedIdeas();
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert(err.response?.data?.error || 'Failed to delete idea. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      reviewed: 'info',
      dismissed: 'secondary',
      action_taken: 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
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
            <FaClipboardList className="me-2 text-warning" />
            Flagged Ideas Management
          </h2>
          <p className="text-muted mb-0">Review and manage reported ideas</p>
        </div>
        <div className="text-end">
          <h5 className="mb-0 text-danger">{total}</h5>
          <small className="text-muted">Total Flagged</small>
        </div>
      </div>

      {/* Status Filter */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            {['pending', 'reviewed', 'dismissed', 'action_taken', 'all'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleStatusFilterChange(status)}
              >
                {status.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Flagged Ideas List */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading flagged ideas...</p>
            </div>
          ) : flaggedIdeas.length === 0 ? (
            <div className="text-center py-5">
              <FaFlag className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
              <p className="text-muted">
                No flagged ideas found with status: {statusFilter}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Idea</th>
                    <th>Author</th>
                    <th className="text-center">Reports</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedIdeas.map((item) => {
                    // Check if there are any pending reports
                    const hasPendingReports = item.reports && item.reports.some(report => report.status === 'pending');
                    
                    return (
                    <React.Fragment key={item.idea_id}>
                      <tr>
                        <td>
                          <div>
                            <strong className="d-block">{item.idea.title}</strong>
                            <small className="text-muted">ID: #{item.idea.id}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {/* <strong>{item.idea.user.username}</strong>
                            <br /> */}
                            <small className="text-muted">{item.idea.user.email}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <Badge bg="danger" pill className="px-3">
                            <FaFlag className="me-1" />
                            {item.report_count}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setExpandedIdea(expandedIdea === item.idea_id ? null : item.idea_id)}
                            >
                              {expandedIdea === item.idea_id ? <FaChevronUp /> : <FaChevronDown />}
                              {' '}Details
                            </Button>
                            {hasPendingReports && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(item, 'all')}
                                >
                                  Update All
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  title="Delete Idea"
                                >
                                  <FaTrash />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => navigate(`/ideas/${item.idea_id}`)}
                            >
                              <FaEye /> View
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="p-0 border-0">
                          <Collapse in={expandedIdea === item.idea_id}>
                            <div className="p-3 bg-light">
                              <h6 className="mb-3">Reports ({item.report_count})</h6>
                              <Table size="sm" bordered className="bg-white">
                                <thead>
                                  <tr>
                                    <th>Reporter</th>
                                    <th>Reason</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.reports.map((report) => (
                                    <tr key={report.id}>
                                      <td>
                                        <small>
                                          {/* <strong>{report.reporter.username}</strong>
                                          <br /> */}
                                          {report.reporter.email}
                                        </small>
                                      </td>
                                      <td><Badge bg="warning" text="dark">{report.reason}</Badge></td>
                                      <td><small>{report.description || 'No details'}</small></td>
                                      <td>{getStatusBadge(report.status)}</td>
                                      <td><small>{formatDate(report.created_at)}</small></td>
                                      <td>
                                        {report.status === 'pending' ? (
                                          <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(report, 'single')}
                                          >
                                            Update
                                          </Button>
                                        ) : (
                                          <small className="text-muted">-</small>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                              {item.report_count > 5 && (
                                <small className="text-muted">
                                  Showing first 5 of {item.report_count} reports
                                </small>
                              )}
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                    );
                  })}
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

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6">Update Report Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>New Status</Form.Label>
            <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">Select status...</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="action_taken">Action Taken</option>
            </Form.Select>
          </Form.Group>
          {selectedItem?.type === 'all' && (
            <Alert variant="info" className="mt-3 mb-0 py-2 small">
              This will update all {selectedItem.report_count} reports for this idea.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleUpdateAllFlags}
            disabled={!newStatus || updating}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Idea Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h6">
            <FaTrash className="text-danger me-2" />
            Delete Idea
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-3">
            <strong>Warning:</strong> This action cannot be undone! All comments and data associated with this idea will also be deleted.
          </Alert>
          <p className="mb-2">Are you sure you want to delete this idea?</p>
          {ideaToDelete && (
            <Card className="bg-light border">
              <Card.Body className="py-2">
                <small className="d-block mb-1">
                  <strong>Title:</strong> {ideaToDelete.idea.title}
                </small>
                <small className="d-block mb-1">
                  <strong>Author:</strong> {ideaToDelete.idea.user.email}
                </small>
                <small className="d-block mb-1">
                  <strong>ID:</strong> #{ideaToDelete.idea.id}
                </small>
                <small className="d-block">
                  <strong>Reports:</strong> <Badge bg="danger">{ideaToDelete.report_count}</Badge>
                </small>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={handleDeleteIdea}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-1" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Delete Idea
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IdeasManagement;
