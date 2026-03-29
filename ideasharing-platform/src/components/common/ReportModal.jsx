import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaFlag, FaExclamationTriangle } from 'react-icons/fa';
import { reportsAPI } from '../../services/api';

const REPORT_REASONS = [
  { value: 'Spam', label: 'Spam' },
  { value: 'Inappropriate Content', label: 'Inappropriate Content' },
  { value: 'Harassment', label: 'Harassment' },
  { value: 'Misinformation', label: 'Misinformation' },
  { value: 'Copyright Violation', label: 'Copyright Violation' },
  { value: 'Other', label: 'Other' },
];

const ReportModal = ({ show, onHide, type, itemId, itemTitle, onReportSuccess }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reportData = {
        reason,
        description: description.trim()
      };

      if (type === 'idea') {
        await reportsAPI.reportIdea(itemId, reportData);
      } else if (type === 'comment') {
        await reportsAPI.reportComment(itemId, reportData);
      }

      setSuccess(true);
      
      // Call success callback if provided
      if (onReportSuccess) {
        onReportSuccess();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Error submitting report:', err);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'You cannot report your own content');
      } else if (err.response?.status === 409) {
        setError('You have already reported this content');
      } else {
        setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    setError('');
    setSuccess(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-danger d-flex align-items-center h6">
          <FaFlag className="me-2" />
          Report {type === 'idea' ? 'Idea' : 'Comment'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        {success ? (
          <Alert variant="success" className="mb-0">
            <FaExclamationTriangle className="me-2" />
            Report submitted successfully! Our team will review it shortly.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" className="mb-3 py-2 small">
                {error}
              </Alert>
            )}

            {/* Content Preview */}
            {itemTitle && (
              <div className="bg-light p-3 rounded mb-3">
                <small className="text-muted d-block mb-1">
                  {type === 'idea' ? 'Idea:' : 'Comment:'}
                </small>
                <p className="mb-0 small" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {itemTitle}
                </p>
              </div>
            )}

            {/* Reason Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Reason <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Additional Details (Optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Provide additional context about why you're reporting this content..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {description.length}/500 characters
              </Form.Text>
            </Form.Group>

            <Alert variant="warning" className="mb-3 py-2 small">
              <FaExclamationTriangle className="me-2" />
              <strong>Note:</strong> False reports may result in action against your account.
            </Alert>

            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                type="submit"
                disabled={loading || !reason}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaFlag className="me-1" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReportModal;
