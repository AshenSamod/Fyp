import React, { useState } from 'react';
import { Card, Badge, Button, Modal } from 'react-bootstrap';
import { FaCalendar, FaEye, FaComment, FaUser, FaUserShield, FaClock, FaPencilAlt, FaFlag } from 'react-icons/fa';
import { formatCategoryName } from '../../utils/categoryUtils';
import ReportModal from '../common/ReportModal';

const IdeaContent = ({ idea, currentUser }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState(`Interest in your idea: ${idea.title}`);
  const [contactBody, setContactBody] = useState(`Hi ${idea.author?.full_name || idea.author?.username || 'Author'},\n\nI saw your idea on the platform and would like to discuss it.\n\n`);

  // Check if current user can report (not the author)
  const canReport = currentUser && idea.author && (
    currentUser.id !== idea.author.id
  );

  const canContactAuthor = currentUser && idea.author && (currentUser.id !== idea.author.id) && (currentUser.role === 'investor');
  
  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    return category.name || 'Uncategorized';
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="p-3 p-md-4">
        {/* Category and Date */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3 gap-2">
          <Badge bg={getCategoryVariant(getCategoryName(idea.category))} className="mb-2 mb-sm-0">
            {formatCategoryName(getCategoryName(idea.category))}
            {idea.is_category_corrected && (
              <FaPencilAlt className="ms-1" size={10} title="Category edited by user" />
            )}
          </Badge>
          <small className="text-muted d-flex align-items-center">
            <FaCalendar className="me-1" />
            {formatDate(idea.created_at)}
          </small>
        </div>

        {/* Title */}
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <h2 className="mb-0">{idea.title}</h2>
          <div className="d-flex gap-2">
            {canReport && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowReportModal(true)}
                title="Report this idea"
              >
                <FaFlag className="me-1" />
                <span className="d-none d-sm-inline">Report</span>
              </Button>
            )}
            {canContactAuthor && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowContactModal(true)}
                title="Contact author"
              >
                <FaUser className="me-1" />
                <span className="d-none d-sm-inline">Contact Author</span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <div 
          className="text-secondary mb-4" 
          style={{ lineHeight: '1.8', fontSize: '1.05rem' }}
          dangerouslySetInnerHTML={{ __html: idea.description }}
        />

        {/* Author Info */}
        {idea.author && (
          <div className="mb-3 p-3 bg-light rounded">
            <div className="text-muted small mb-2 d-flex align-items-center gap-2 flex-wrap">
              {idea.author.is_admin ? (
                <FaUserShield className="text-warning" title="Admin" />
              ) : (
                <FaUser />
              )}
              <span>
                By <strong className="text-dark">{idea.author.full_name}</strong>
                {idea.author.is_admin && (
                  <Badge bg="warning" text="dark" className="ms-2 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                    ADMIN
                  </Badge>
                )}
              </span>
              <span className="text-muted">•</span>
              <span className="d-flex align-items-center gap-1">
                <FaClock size={12} />
                Member since {formatDate(idea.author.created_at)}
              </span>
            </div>
            {idea.author.bio && (
              <p className="small text-muted mb-0 mt-2" style={{ fontStyle: 'italic' }}>
                "{idea.author.bio}"
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="d-flex gap-4 text-muted small pt-3 border-top">
          <span className="d-flex align-items-center">
            <FaEye className="me-1" />
            {idea.view_count} views
          </span>
          {/* <span className="d-flex align-items-center">
            <FaHeart className="me-1 text-danger" />
            {idea.like_count} likes
          </span> */}
          <span className="d-flex align-items-center">
            <FaComment className="me-1 text-primary" />
            {idea.comment_count} comments
          </span>
        </div>
      </Card.Body>

      {/* Report Modal */}
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        type="idea"
        itemId={idea.id}
        itemTitle={idea.title}
        onReportSuccess={() => {
          // Optional: Show success message or refresh
        }}
      />

      {/* Contact Author Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Author</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            {/* <label className="form-label">To</label> */}
            <input
              type="hidden"
              className="form-control"
              value={idea.author?.email || ''}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              rows={5}
              value={contactBody}
              onChange={(e) => setContactBody(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const mailto = `mailto:${encodeURIComponent(idea.author?.email || '')}?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactBody)}`;
              window.location.href = mailto;
              setShowContactModal(false);
            }}
          >
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default IdeaContent;
