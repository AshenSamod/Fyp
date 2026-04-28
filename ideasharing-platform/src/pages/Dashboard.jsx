import React, { useState, useEffect } from 'react';
import { Container, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import SearchFilters from '../components/dashboard/SearchFilters';
import IdeasList from '../components/dashboard/IdeasList';
import { ideasAPI } from '../services/api';
import { useAuth } from '../utils/authContext';
import { 
  getDefaultCategories, 
  transformCategories, 
  addSpecialCategories 
} from '../utils/categoryUtils';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all-ideas');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState(getDefaultCategories());
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        
        const response = await ideasAPI.getCategories();
        const apiCategories = response.data.categories || [];
        // const total = response.data.total || 0; // Not currently used
        
        // Transform API categories to UI format
        const transformedCategories = transformCategories(apiCategories);
        
        // Calculate total ideas count
        const totalIdeas = transformedCategories.reduce(
          (sum, cat) => sum + (cat.idea_count || 0), 
          0
        );
        
        // Add "All Ideas" at start and "Uncategorized" at end
        const finalCategories = addSpecialCategories(transformedCategories, totalIdeas);
        
        setCategories(finalCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories. Using defaults.');
        
        // Keep default categories on error
        const defaultCats = getDefaultCategories();
        const finalCategories = addSpecialCategories(defaultCats.slice(1), 0);
        setCategories(finalCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch ideas based on filters
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setIdeasLoading(true);
        setIdeasError(null);
        
        // Build search parameters
        const params = {
          page: currentPage,
          per_page: 20,
          sort_by: sortBy || 'recent'
        };
        
        // Add search term if provided
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        // Add category filter (skip for 'all-ideas')
        if (activeTab !== 'all-ideas') {
          const selectedCategory = categories.find(cat => 
            (cat.key || cat.id) === activeTab
          );
          if (selectedCategory && selectedCategory.name !== 'all') {
            params.category = selectedCategory.name;
          }
        }
        
        // Add date filters
        if (dateRange.start) {
          params.date_from = dateRange.start;
        }
        if (dateRange.end) {
          params.date_to = dateRange.end;
        }
        
        const response = await ideasAPI.search(params);
        
        setIdeas(response.data.ideas || []);
        setTotalIdeas(response.data.total || 0);
        setTotalPages(response.data.pages || 1);
        
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setIdeasError('Failed to load ideas. Please try again.');
        setIdeas([]);
      } finally {
        setIdeasLoading(false);
      }
    };

    // Only fetch if categories are loaded
    if (!categoriesLoading) {
      fetchIdeas();
    }
    // include sortBy in deps so changing it refetches
  }, [activeTab, searchTerm, dateRange, currentPage, categoriesLoading, sortBy, categories]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentPage(1); // Reset to first page on date change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handleViewIdea = (ideaId) => {
    // TODO: Implement view idea functionality
    console.log('View idea:', ideaId);
  };

  const handleIdeaDeleted = async (deletedIdeaId) => {
    // Remove the deleted idea from the list
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== deletedIdeaId));
    
    // Update the total count
    setTotalIdeas(prev => Math.max(0, prev - 1));
    
    // If the current page is now empty and it's not the first page, go to previous page
    if (ideas.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container fluid className="py-3 py-lg-4 px-3 px-lg-4">
      {/* Platform Logo */}
      <div className="mb-4 d-none d-lg-block">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="text-primary fw-bold mb-0">IdeaSharing Platform</h3>
            <p className="text-muted small mb-0">Share your innovative ideas with the world</p>
          </div>
          {user?.role === 'idea_creator' && (
            <Button 
              variant="primary" 
              className="d-flex align-items-center gap-2"
              onClick={() => navigate('/ideas/new')}
            >
              <FaPlus /> Create Idea
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Create Button */}
      {user?.role === 'idea_creator' && (
        <div className="d-lg-none mb-3">
          <Button 
            variant="primary" 
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate('/ideas/new')}
          >
            <FaPlus /> Create New Idea
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <SearchFilters 
        onSearchChange={handleSearchChange}
        onDateRangeChange={handleDateRangeChange}
        searchTerm={searchTerm}
      />

      {/* Error Alerts */}
      {categoriesError && (
        <Alert variant="warning" dismissible onClose={() => setCategoriesError(null)} className="mb-3">
          {categoriesError}
        </Alert>
      )}
      {ideasError && (
        <Alert variant="danger" dismissible onClose={() => setIdeasError(null)} className="mb-3">
          {ideasError}
        </Alert>
      )}

      {/* Category Tabs */}
      <div className="bg-white border rounded mb-4 shadow-sm">
        <div className="category-tabs-wrapper">
          {categoriesLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" variant="primary" />
              <span className="ms-2 text-muted">Loading categories...</span>
            </div>
          ) : (
            <Nav 
              variant="tabs" 
              activeKey={activeTab}
              onSelect={handleTabChange}
              className="category-tabs"
            >
              {categories.map(cat => (
                <Nav.Item key={cat.key || cat.id}>
                  <Nav.Link eventKey={cat.key || cat.id} className="px-3 py-2">
                    <span className="d-none d-md-inline">
                      {cat.displayName}
                      {cat.idea_count > 0 && (
                        <span className="badge bg-secondary ms-2">{cat.idea_count}</span>
                      )}
                    </span>
                    <span className="d-md-none">
                      {cat.displayName.split(' ')[0]}
                      {cat.idea_count > 0 && (
                        <span className="badge bg-secondary ms-1">{cat.idea_count}</span>
                      )}
                    </span>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
            <h5 className="mb-0">
              {categories.find(cat => (cat.key || cat.id) === activeTab)?.displayName || 'Ideas'}
              {!ideasLoading && (
                <span className="text-muted fs-6 ms-2">({totalIdeas} {totalIdeas === 1 ? 'idea' : 'ideas'})</span>
              )}
            </h5>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
                <p className="mb-0 fw-medium" style={{ minWidth: 70 }}>Sort by :</p>
                <select
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  style={{ minWidth: 160 }}
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="views_desc">Most viewed</option>
                  <option value="views_asc">Least viewed</option>
                  <option value="comments_desc">Most commented</option>
                  <option value="comments_asc">Least commented</option>
                </select>
              </div>
              {totalPages > 1 && (
                <small className="text-muted">
                  Page {currentPage} of {totalPages}
                </small>
              )}
            </div>
          </div>

          {ideasLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Loading ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted fs-5">No ideas found</p>
              <p className="text-muted small">
                {searchTerm || dateRange.start || dateRange.end 
                  ? 'Try adjusting your filters' 
                  : 'Be the first to share an idea!'}
              </p>
            </div>
          ) : (
            <IdeasList
              ideas={ideas}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onViewIdea={handleViewIdea}
              onIdeaDeleted={handleIdeaDeleted}
            />
          )}
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;