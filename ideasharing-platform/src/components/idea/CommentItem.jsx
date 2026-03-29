import React, { useState } from 'react';
import { Badge, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { FaUser, FaUserShield, FaClock, FaReply, FaPaperPlane, FaEdit, FaTrash, FaExclamationTriangle, FaSave, FaTimes, FaFlag } from 'react-icons/fa';
import { commentsAPI } from '../../services/api';
import ReportModal from '../common/ReportModal';

const CommentItem = ({ 
  comment, 
  replyingTo, 
  replyContent, 
  onReplyToggle, 
  onReplyChange, 
  onReplySubmit, 
  onReplyCancel,
  submitting,
  currentUserId,
  onCommentUpdated,
  onCommentDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  
  // State for reply editing and deletion
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyEditContent, setReplyEditContent] = useState('');
  const [isUpdatingReply, setIsUpdatingReply] = useState(false);
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  const [deleteReplyError, setDeleteReplyError] = useState('');
  const [reportingReply, setReportingReply] = useState(null);

  const isAuthor = currentUserId && comment.author && (
    currentUserId === comment.author.id || 
    currentUserId === comment.author.user_id
  );

  // Check if current user can report (not the author)
  const canReport = currentUserId && comment.author && !isAuthor;
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsUpdating(true);
    try {
      await commentsAPI.update(comment.id, { content: editContent.trim() });
      setIsEditing(false);
      
      // Notify parent to refresh comments
      if (onCommentUpdated) {
        onCommentUpdated(comment.id);
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      alert(err.response?.data?.error || 'Failed to update comment. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await commentsAPI.delete(comment.id);
      setShowDeleteModal(false);
      
      // Notify parent to refresh comments
      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete comment. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteError('');
  };

  // Reply edit handlers
  const handleReplyEditClick = (reply) => {
    setEditingReplyId(reply.id);
    setReplyEditContent(reply.content);
  };

  const handleReplyEditCancel = () => {
    setEditingReplyId(null);
    setReplyEditContent('');
  };

  const handleReplyEditSubmit = async (e, replyId) => {
    e.preventDefault();
    if (!replyEditContent.trim()) return;

    setIsUpdatingReply(true);
    try {
      await commentsAPI.update(replyId, { content: replyEditContent.trim() });
      setEditingReplyId(null);
      setReplyEditContent('');
      
      // Notify parent to refresh comments
      if (onCommentUpdated) {
        onCommentUpdated(replyId);
      }
    } catch (err) {
      console.error('Error updating reply:', err);
      alert(err.response?.data?.error || 'Failed to update reply. Please try again.');
    } finally {
      setIsUpdatingReply(false);
    }
  };

  // Reply delete handlers
  const handleReplyDeleteClick = (reply) => {
    setReplyToDelete(reply);
    setShowDeleteReplyModal(true);
    setDeleteReplyError('');
  };

  const handleReplyDeleteConfirm = async () => {
    if (!replyToDelete) return;

    setIsDeletingReply(true);
    setDeleteReplyError('');

    try {
      await commentsAPI.delete(replyToDelete.id);
      setShowDeleteReplyModal(false);
      setReplyToDelete(null);
      
      // Notify parent to refresh comments
      if (onCommentDeleted) {
        onCommentDeleted(replyToDelete.id);
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
      setDeleteReplyError(err.response?.data?.error || 'Failed to delete reply. Please try again.');
      setIsDeletingReply(false);
    }
  };

  const handleReplyDeleteCancel = () => {
    setShowDeleteReplyModal(false);
    setReplyToDelete(null);
    setDeleteReplyError('');
  };

  const isReplyAuthor = (reply) => {
    return currentUserId && reply.author && (
      currentUserId === reply.author.id || 
      currentUserId === reply.author.user_id
    );
  };

  const canReportReply = (reply) => {
    return currentUserId && reply.author && !isReplyAuthor(reply);
  };

  return (
    <div className="mb-4 pb-3 border-bottom">
      {/* Comment Header */}
      <div className="d-flex align-items-start gap-3 mb-2">
        <div 
          className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white flex-shrink-0"
          style={{ width: '40px', height: '40px', fontSize: '1rem' }}
        >
          {comment.author.is_admin ? <FaUserShield /> : <FaUser />}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-1">
            <div className="d-flex align-items-center gap-2">
              <strong>{comment.author.full_name}</strong>
              {comment.author.is_admin && (
                <Badge bg="warning" text="dark" className="px-2 py-1" style={{ fontSize: '0.6rem' }}>
                  ADMIN
                </Badge>
              )}
            </div>
            <small className="text-muted">
              <FaClock size={10} className="me-1" />
              {formatDateTime(comment.created_at)}
            </small>
          </div>
          
          {/* Comment Content or Edit Form */}
          {isEditing ? (
            <Form onSubmit={handleEditSubmit} className="mb-2">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={isUpdating}
                />
              </Form.Group>
              <div className="d-flex gap-2 mt-2">
                <Button 
                  type="submit" 
                  variant="success" 
                  size="sm"
                  disabled={isUpdating || !editContent.trim()}
                >
                  {isUpdating ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-1" />
                      Save
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleEditCancel}
                  disabled={isUpdating}
                >
                  <FaTimes className="me-1" />
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <p className="mb-2 text-secondary">{comment.content}</p>
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none"
                  onClick={() => onReplyToggle(comment.id)}
                >
                  <FaReply className="me-1" />
                  Reply
                </Button>
                
                {/* Edit and Delete buttons for comment author */}
                {isAuthor && (
                  <>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none text-success"
                      onClick={handleEditClick}
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-decoration-none text-danger"
                      onClick={handleDeleteClick}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </Button>
                  </>
                )}

                {/* Report button for non-authors */}
                {canReport && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-warning"
                    onClick={() => setShowReportModal(true)}
                    title="Report comment"
                  >
                    <FaFlag className="me-1" />
                    Report
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center h6">
            <FaExclamationTriangle className="me-2" />
            Delete Comment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {deleteError && (
            <div className="alert alert-danger mb-3 py-2 small">
              {deleteError}
            </div>
          )}
          <p className="mb-2 small">
            Are you sure you want to delete this comment?
          </p>
          <div className="bg-light p-2 rounded">
            <p className="text-muted small mb-0" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {comment.content}
            </p>
          </div>
          <p className="text-danger small mt-2 mb-0">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ms-5 mt-3">
          <Form onSubmit={(e) => onReplySubmit(e, comment.id)}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={`Reply to ${comment.author.full_name}...`}
                value={replyContent}
                onChange={(e) => onReplyChange(e.target.value)}
                disabled={submitting}
                size="sm"
              />
            </Form.Group>
            <div className="d-flex gap-2 mt-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="sm"
                disabled={submitting || !replyContent.trim()}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-1" />
                    Reply
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={onReplyCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ms-5 mt-3">
          {comment.replies.map((reply) => {
            const isReplyOwner = isReplyAuthor(reply);
            const canReportThisReply = canReportReply(reply);
            
            return (
              <div key={reply.id} className="mb-3">
                <div className="d-flex align-items-start gap-2">
                  <div 
                    className="rounded-circle bg-secondary bg-gradient d-flex align-items-center justify-content-center text-white flex-shrink-0"
                    style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                  >
                    {reply.author.is_admin ? <FaUserShield /> : <FaUser />}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <strong className="small">{reply.author.full_name}</strong>
                        {reply.author.is_admin && (
                          <Badge bg="warning" text="dark" className="px-1 py-0" style={{ fontSize: '0.55rem' }}>
                            ADMIN
                          </Badge>
                        )}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        <FaClock size={9} className="me-1" />
                        {formatDateTime(reply.created_at)}
                      </small>
                    </div>
                    
                    {/* Reply content or edit form */}
                    {editingReplyId === reply.id ? (
                      <Form onSubmit={(e) => handleReplyEditSubmit(e, reply.id)} className="mb-2">
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={replyEditContent}
                            onChange={(e) => setReplyEditContent(e.target.value)}
                            disabled={isUpdatingReply}
                            size="sm"
                          />
                        </Form.Group>
                        <div className="d-flex gap-2 mt-2">
                          <Button 
                            type="submit" 
                            variant="success" 
                            size="sm"
                            disabled={isUpdatingReply || !replyEditContent.trim()}
                          >
                            {isUpdatingReply ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FaSave className="me-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={handleReplyEditCancel}
                            disabled={isUpdatingReply}
                          >
                            <FaTimes className="me-1" />
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <p className="mb-1 text-secondary small">{reply.content}</p>
                        <div className="d-flex gap-2">
                          {/* Edit and Delete buttons for reply author */}
                          {isReplyOwner && (
                            <>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-decoration-none text-success"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleReplyEditClick(reply)}
                              >
                                <FaEdit className="me-1" />
                                Edit
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-decoration-none text-danger"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleReplyDeleteClick(reply)}
                              >
                                <FaTrash className="me-1" />
                                Delete
                              </Button>
                            </>
                          )}

                          {/* Report button for non-authors */}
                          {canReportThisReply && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none text-warning"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => setReportingReply(reply)}
                              title="Report reply"
                            >
                              <FaFlag className="me-1" />
                              Report
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        type="comment"
        itemId={comment.id}
        itemTitle={comment.content}
        onReportSuccess={() => {
          // Optional: Show success message
        }}
      />

      {/* Delete Reply Confirmation Modal */}
      <Modal show={showDeleteReplyModal} onHide={handleReplyDeleteCancel} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center h6">
            <FaExclamationTriangle className="me-2" />
            Delete Reply
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {deleteReplyError && (
            <div className="alert alert-danger mb-3 py-2 small">
              {deleteReplyError}
            </div>
          )}
          <p className="mb-2 small">
            Are you sure you want to delete this reply?
          </p>
          {replyToDelete && (
            <div className="bg-light p-2 rounded">
              <p className="text-muted small mb-0" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {replyToDelete.content}
              </p>
            </div>
          )}
          <p className="text-danger small mt-2 mb-0">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleReplyDeleteCancel}
            disabled={isDeletingReply}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleReplyDeleteConfirm}
            disabled={isDeletingReply}
          >
            {isDeletingReply ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Report Reply Modal */}
      {reportingReply && (
        <ReportModal
          show={!!reportingReply}
          onHide={() => setReportingReply(null)}
          type="comment"
          itemId={reportingReply.id}
          itemTitle={reportingReply.content}
          onReportSuccess={() => {
            setReportingReply(null);
          }}
        />
      )}
    </div>
  );
};

export default CommentItem;
