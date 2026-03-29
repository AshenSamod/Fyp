import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '../utils/authContext';
import { ideasAPI } from '../services/api';
import IdeasList from '../components/dashboard/IdeasList';
import '../styles/dashboard.css';

const MyIdeas = () => {
  // const { user } = useAuth(); // Not currently used
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const perPage = 20;

  const fetchMyIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await ideasAPI.getMyIdeas({
        page: currentPage,
        per_page: perPage
      });
      
      const ideasData = response.data.ideas || [];
      setIdeas(ideasData);
      
      // The API returns pagination data at the root level, not nested
      const total = response.data.total || ideasData.length;
      const pages = response.data.pages || 1;
      
      setTotalIdeas(total);
      setTotalPages(pages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching my ideas:', err);
      setError(err.response?.data?.error || 'Failed to load your ideas. Please try again.');
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMyIdeas();
  }, [fetchMyIdeas]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}`);
  };

  const handleEditIdea = (ideaId) => {
    navigate(`/ideas/${ideaId}/edit`);
  };

  const handleIdeaDeleted = (deletedIdeaId) => {
    // Refresh the ideas list after deletion
    fetchMyIdeas();
  };

  return (
    <Container fluid className="py-3 py-lg-4 px-3 px-lg-4">
      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="text-primary fw-bold mb-2">My Ideas</h3>
            <p className="text-muted mb-0">
              View and manage all your submitted ideas
              {!loading && totalIdeas > 0 && (
                <span> ({totalIdeas} {totalIdeas === 1 ? 'idea' : 'ideas'})</span>
              )}
            </p>
          </div>
          <Button 
            variant="primary" 
            className="d-none d-md-flex align-items-center gap-2"
            onClick={() => navigate('/ideas/new')}
          >
            <FaPlus /> Create Idea
          </Button>
        </div>
      </div>

      {/* Mobile Create Button */}
      <div className="d-md-none mb-3">
        <Button 
          variant="primary" 
          className="w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate('/ideas/new')}
        >
          <FaPlus /> Create New Idea
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
          {error}
        </Alert>
      )}

      {/* Content */}
      <div className="bg-white border rounded mb-4 shadow-sm">
        <div className="p-3 p-md-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Loading your ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted mb-3">No ideas yet</h5>
              <p className="text-muted mb-4">
                Start sharing your innovative ideas with the community!
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/ideas/new')}
              >
                Create Your First Idea
              </Button>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">
                  Your Ideas
                  <span className="text-muted fs-6 ms-2">
                    ({totalIdeas} {totalIdeas === 1 ? 'idea' : 'ideas'})
                  </span>
                </h5>
                {totalPages > 1 && (
                  <small className="text-muted">
                    Page {currentPage} of {totalPages}
                  </small>
                )}
              </div>

              <IdeasList
                ideas={ideas}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onViewIdea={handleViewIdea}
                onEditIdea={handleEditIdea}
                onIdeaDeleted={handleIdeaDeleted}
              />
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default MyIdeas;
