import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../utils/authContext';
import IdeaContent from '../components/idea/IdeaContent';
import CommentsSection from '../components/idea/CommentsSection';
import { ideasAPI, commentsAPI } from '../services/api';

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Idea state
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // State declarations...
  const fetchedRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchIdea = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      console.log('Skipping duplicate idea fetch');
      return;
    }
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      setError('');
      console.log('Calling API: GET /ideas/' + id, 'Timestamp:', now);
      const response = await ideasAPI.getById(id);
      console.log('Idea response received:', Date.now());
      setIdea(response.data.idea);
    } catch (err) {
      console.error('Error fetching idea:', err);
      setError(err.response?.data?.message || 'Failed to load idea');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setCommentsLoading(true);
      } else {
        setLoadingMore(true);
      }
      console.log('Calling API: GET /comments/idea/' + id, 'Timestamp:', Date.now());
      const response = await commentsAPI.getByIdeaId(id, { page, per_page: 30 });
      console.log('Comments response received:', Date.now());
      if (append) {
        setComments(prev => [...prev, ...response.data.comments]);
      } else {
        setComments(response.data.comments);
      }
      setCommentsPage(page);
      if (response.data.comments.length < 30) {
        setHasMoreComments(false);
      } else {
        setHasMoreComments(true);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  const loadMoreComments = async () => {
    const nextPage = commentsPage + 1;
    await fetchComments(nextPage, true);
  };

  useEffect(() => {
    return () => {
      fetchedRef.current = false;
    };
  }, [id]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    console.log('Initial fetch for ID:', id);
    fetchIdea();
    fetchComments();
  }, [id, fetchIdea, fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.create({
        idea_id: parseInt(id),
        content: newComment.trim()
      });
      setNewComment('');
      await fetchComments(1);
      setCommentsPage(1);
      setHasMoreComments(true);
      setIdea(prev => ({ ...prev, comment_count: prev.comment_count + 1 }));
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert(err.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.create({
        idea_id: parseInt(id),
        content: replyContent.trim(),
        parent_id: parentId
      });
      setReplyContent('');
      setReplyingTo(null);
      await fetchComments(1);
      setCommentsPage(1);
      setHasMoreComments(true);
      setIdea(prev => ({ ...prev, comment_count: prev.comment_count + 1 }));
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/ideas/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      await ideasAPI.delete(id);
      // Navigate to dashboard after successful deletion
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting idea:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete idea. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteError('');
  };

  const handleCommentUpdated = async () => {
    // Refresh comments after update
    await fetchComments(1);
    setCommentsPage(1);
    setHasMoreComments(true);
  };

  const handleCommentDeleted = async () => {
    // Refresh comments and update comment count
    await fetchComments(1);
    setCommentsPage(1);
    setHasMoreComments(true);
    setIdea(prev => ({ ...prev, comment_count: Math.max(0, prev.comment_count - 1) }));
  };

  // const handleTabChange = (tab) => {
  //   console.log('Navigate to:', tab);
  // };

  // Check if current user is the author
  const isAuthor = user && idea && idea.author && (
    user.id === idea.author.id
  );

  if (loading) {
    return (
      <Container fluid className="p-3 p-md-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p className="mt-3 text-muted">Loading idea...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-3 p-md-4">
        <Alert variant="danger" className="m-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft className="me-2" />
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 p-md-4">
      {/* Back Button and Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft className="me-2" />
          Back to Ideas
        </Button>

        {/* Edit and Delete Buttons (only for author) */}
        {isAuthor && (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={handleEditClick}
            >
              <FaEdit className="me-2" />
              <span className="d-none d-sm-inline">Edit Idea</span>
              <span className="d-sm-none">Edit</span>
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleDeleteClick}
            >
              <FaTrash className="me-2" />
              <span className="d-none d-sm-inline">Delete Idea</span>
              <span className="d-sm-none">Delete</span>
            </Button>
          </div>
        )}
      </div>

      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={9}>
          {/* Idea Content */}
          <IdeaContent idea={idea} currentUser={user} />

          {/* Comments Section */}
          <CommentsSection
            comments={comments}
            commentsLoading={commentsLoading}
            commentCount={idea.comment_count}
            newComment={newComment}
            setNewComment={setNewComment}
            handleSubmitComment={handleSubmitComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmitReply={handleSubmitReply}
            submitting={submitting}
            currentUserId={user?.id}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
            hasMoreComments={hasMoreComments}
            loadingMore={loadingMore}
            loadMoreComments={loadMoreComments}
          />
        </Col>
      </Row>

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
          {idea && (
            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold text-dark mb-2">{idea.title}</h6>
              <p className="text-muted small mb-0" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {idea.description}
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
    </Container>
  );
};

export default IdeaDetail;
