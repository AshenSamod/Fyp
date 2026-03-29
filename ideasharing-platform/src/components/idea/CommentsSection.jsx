import React from 'react';
import { Card, Spinner, Button } from 'react-bootstrap';
import { FaComment } from 'react-icons/fa';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const CommentsSection = ({ 
  comments, 
  commentsLoading, 
  commentCount,
  newComment,
  setNewComment,
  handleSubmitComment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  submitting,
  currentUserId,
  onCommentUpdated,
  onCommentDeleted,
  hasMoreComments,
  loadingMore,
  loadMoreComments
}) => {
  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 py-3 px-3 px-md-4">
        <h5 className="mb-0 fw-bold">
          <FaComment className="me-2 text-primary" />
          Comments ({commentCount})
        </h5>
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        {/* Add Comment Form */}
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmitComment}
          submitting={submitting}
        />

        {/* Comments List */}
        {commentsLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-2 text-muted small">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-5">
            <FaComment className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
            <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyToggle={(id) => setReplyingTo(replyingTo === id ? null : id)}
                onReplyChange={setReplyContent}
                onReplySubmit={handleSubmitReply}
                onReplyCancel={handleReplyCancel}
                submitting={submitting}
                currentUserId={currentUserId}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
              />
            ))}
            {hasMoreComments && (
              <div className="text-center mt-3">
                <Button
                  variant="outline-primary"
                  onClick={loadMoreComments}
                  disabled={loadingMore}
                  size="sm"
                >
                  {loadingMore ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Comments'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentsSection;
