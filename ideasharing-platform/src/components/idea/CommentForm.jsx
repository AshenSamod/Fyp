import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';

const CommentForm = ({ value, onChange, onSubmit, submitting, placeholder = "Share your thoughts about this idea..." }) => {
  return (
    <Form onSubmit={onSubmit} className="mb-4">
      <Form.Group>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={submitting}
        />
      </Form.Group>
      <div className="d-flex justify-content-end mt-2">
        <Button 
          type="submit" 
          variant="primary" 
          size="sm"
          disabled={submitting || !value.trim()}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Posting...
            </>
          ) : (
            <>
              <FaPaperPlane className="me-2" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CommentForm;
