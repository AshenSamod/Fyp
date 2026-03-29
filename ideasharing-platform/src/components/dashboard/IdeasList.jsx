import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { FaEye, FaComment, FaCalendar, FaUser, FaUserShield, FaClock, FaPencilAlt, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../utils/authContext';
import { formatCategoryName } from '../../utils/categoryUtils';
import { ideasAPI } from '../../services/api';

const IdeasList = ({ ideas, currentPage, totalPages, onPageChange, onViewIdea, onEditIdea, onIdeaDeleted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const getCategoryVariant = (categoryName) => {
    const normalized = categoryName?.toLowerCase() || '';
    const variantMap = {
      'software': 'primary',
      'technology': 'primary',
      'medical': 'success',
      'health': 'success',
      'education': 'info',
      'business': 'warning',
      'carsharing': 'info',
      'agriculture': 'success',
      'uncategorized': 'secondary',
    };
    
    return variantMap[normalized] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    return category.name || 'Uncategorized';
  };

  const handleDeleteClick = (idea, e) => {
    e.stopPropagation();
    setIdeaToDelete(idea);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!ideaToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await ideasAPI.delete(ideaToDelete.id);
      setShowDeleteModal(false);
      setIdeaToDelete(null);
      
      // Notify parent component to refresh the list
      if (onIdeaDeleted) {
        onIdeaDeleted(ideaToDelete.id);
      }
    } catch (err) {
      console.error('Error deleting idea:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete idea. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIdeaToDelete(null);
    setDeleteError('');
  };

  return (
    <div>
      <Row className="g-3 g-md-4">
        {ideas.map(idea => {
          const categoryName = getCategoryName(idea.category);
          const categoryDisplay = formatCategoryName(categoryName);
          
          // Check if current user is the author of this idea
          // API returns author object, not user
          const isAuthor = user && idea.author && (
            user.id === idea.author.id
          );
          
          return (
            <Col key={idea.id} xs={12}>
              <Card 
                className="h-100 shadow-sm hover-card" 
                style={{ 
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/ideas/${idea.id}`)}
              >
                <Card.Body className="p-3 p-md-4">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3 gap-2">
                    <Badge bg={getCategoryVariant(categoryName)} className="mb-2 mb-sm-0">
                      {categoryDisplay}
                      {idea.is_category_corrected && (
                        <FaPencilAlt className="ms-1" size={10} title="Category edited by user" />
                      )}
                    </Badge>
                    <small className="text-muted d-flex align-items-center">
                      <FaCalendar className="me-1" />
                      <span className="d-none d-sm-inline">{formatDate(idea.created_at)}</span>
                      <span className="d-sm-none">{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </small>
                  </div>
                  
                  <Card.Title className="h5 mb-3">{idea.title}</Card.Title>
                  <Card.Text className="text-muted mb-3">
                    {idea.description}
                  </Card.Text>
                  
                  {idea.author && (
                    <div className="text-muted small mb-3 d-flex align-items-center gap-2 flex-wrap">
                      {idea.author.is_admin ? (
                        <FaUserShield className="text-warning" title="Admin" />
                      ) : (
                        <FaUser />
                      )}
                      <span>
                        By <strong className="text-dark">{idea.author.full_name}</strong>
                        {idea.author.is_admin && (
                          <Badge bg="warning" text="dark" className="ms-2 px-2 py-1" >
                            ADMIN
                          </Badge>
                        )}
                      </span>
                      <span className="text-muted">  </span>
                      <span className="d-flex align-items-center gap-1">
                        <FaClock size={12} />
                        Member since {formatDate(idea.author.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                    <div className="d-flex gap-3 text-muted flex-wrap">
                      {/* <small className="d-flex align-items-center">
                        <FaHeart className="me-1 text-danger" />
                        <span>{idea.like_count || 0}</span>
                      </small> */}
                      <small className="d-flex align-items-center">
                        <FaEye className="me-1 text-muted" />
                        <span> {idea.view_count || 0} Views</span>
                      </small>
                      <small className="d-flex align-items-center">
                        <FaComment className="me-1 text-primary" />
                        <span> {idea.comment_count || 0} Comments</span>
                      </small>
                    </div>
                    
                    <div className="d-flex gap-2">
                      {isAuthor && (
                        <>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditIdea) {
                                onEditIdea(idea.id);
                              } else {
                                navigate(`/ideas/${idea.id}/edit`);
                              }
                            }}
                            className="px-3"
                            title="Edit Idea"
                          >
                            <FaEdit className="me-1" />
                            <span className="d-none d-sm-inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={(e) => handleDeleteClick(idea, e)}
                            className="px-3"
                            title="Delete Idea"
                          >
                            <FaTrash className="me-1" />
                            <span className="d-none d-sm-inline">Delete</span>
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ideas/${idea.id}`);
                        }}
                        className="px-3"
                      >
                        <FaEye className="me-1" />
                        <span>Read more</span>
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mt-md-5">
          <nav>
            <ul className="pagination pagination-sm">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="d-none d-sm-inline">Previous</span>
                  <span className="d-sm-none">Prev</span>
                </button>
              </li>
              
              {/* Show limited page numbers on mobile */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // On mobile, only show current page and adjacent pages
                if (window.innerWidth < 576) {
                  if (Math.abs(pageNum - currentPage) <= 1 || pageNum === 1 || pageNum === totalPages) {
                    return (
                      <li 
                        key={pageNum} 
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  } else if (Math.abs(pageNum - currentPage) === 2) {
                    return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                  }
                  return null;
                }
                // Show all pages on larger screens
                return (
                  <li 
                    key={pageNum} 
                    className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            Delete Idea
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {deleteError && (
            <div className="alert alert-danger mb-3">
              {deleteError}
            </div>
          )}
          <p className="mb-3">
            Are you sure you want to delete this idea?
          </p>
          {ideaToDelete && (
            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold text-dark mb-2">{ideaToDelete.title}</h6>
              <p className="text-muted small mb-0" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {ideaToDelete.description}
              </p>
            </div>
          )}
          <p className="text-danger small mt-3 mb-0">
            <strong>Warning:</strong> This action cannot be undone. All comments and likes associated with this idea will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="secondary" 
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete Idea
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IdeasList;