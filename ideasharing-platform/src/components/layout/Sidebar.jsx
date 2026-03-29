import React from 'react';
import { Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaLightbulb, 
  FaUser, 
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaList,
  FaComments,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaUserShield,
  FaTags
} from 'react-icons/fa';
import { useAuth } from '../../utils/authContext';

const Sidebar = ({ activeTab, onTabChange, onLogout, isExpanded, onToggleExpand }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get user role
  const userRole = user?.role;

  // Base menu items available to all users
  const baseMenuItems = [
    { key: 'all-ideas', label: 'All Ideas', icon: <FaLightbulb />, path: '/dashboard' },
  ];

  // Items only for idea creators
  const ideaCreatorItems = [
    { key: 'add-idea', label: 'Add Idea', icon: <FaPlus />, path: '/ideas/new' },
    { key: 'my-ideas', label: 'My Ideas', icon: <FaList />, path: '/my-ideas' },
  ];

  // Items for all users
  const commonItems = [
    { key: 'my-commented-ideas', label: 'Commented', icon: <FaComments />, path: '/my-commented-ideas' },
    { key: 'profile', label: 'Profile', icon: <FaUser />, path: '/profile' },
  ];

  // Build menu items based on user role
  let menuItems = [...baseMenuItems];
  
  if (userRole === 'idea_creator') {
    menuItems = [...menuItems, ...ideaCreatorItems, ...commonItems];
  } else {
    // For investors and mentors, only show base items and common items
    menuItems = [...menuItems, ...commonItems];
  }

  // Admin-only menu items
  const adminMenuItems = [
    { key: 'users-management', label: 'Users', icon: <FaUsers />, path: '/admin/users' },
    { key: 'ideas-management', label: 'Ideas', icon: <FaClipboardList />, path: '/admin/ideas' },
    { key: 'posts-management', label: 'Comments', icon: <FaFileAlt />, path: '/admin/posts' },
    { key: 'categories-management', label: 'Categories', icon: <FaTags />, path: '/admin/categories' },
    { key: 'admin-management', label: 'Admins', icon: <FaUserShield />, path: '/admin/admins' },
  ];

  // Check if user is admin
  const isAdmin = user && user.is_admin === true;

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (onTabChange) {
      onTabChange(item.key);
    }
  };

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return activeTab === item.key;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflowX: 'hidden',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6'
    }}>
      {/* Logo and Toggle Button */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ flexShrink: 0 }}>
        {isExpanded && (
          <div>
            <h5 className="mb-0 text-primary fw-bold">IdeaSharing</h5>
            {isAdmin && (
              <Badge bg="warning" text="dark" className="mt-1" style={{ fontSize: '0.65rem' }}>
                ADMIN ACCESS
              </Badge>
            )}
          </div>
        )}
        <Button
          variant="link"
          className="text-secondary p-0 d-none d-lg-block"
          onClick={onToggleExpand}
          style={{ minWidth: 'auto' }}
        >
          {isExpanded ? <FaChevronLeft size={18} /> : <FaChevronRight size={18} />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <div style={{ 
        flex: '1 1 auto', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        minHeight: 0
      }}>
        <Nav variant="pills" className="flex-column p-3">
        {/* Regular Menu Items */}
        {menuItems.map(item => (
          <Nav.Item key={item.key}>
            <Nav.Link
              eventKey={item.key}
              active={isActive(item)}
              onClick={() => handleNavigation(item)}
              className="d-flex align-items-center mb-2 px-3 py-2"
              style={{ 
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              title={!isExpanded ? item.label : ''}
            >
              <span style={{ width: '20px', fontSize: '1.1rem' }}>
                {item.icon}
              </span>
              {isExpanded && (
                <span className="ms-3 fw-medium">{item.label}</span>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}

        {/* Admin Section Divider */}
        {isAdmin && (
          <>
            <hr className="my-3" />
            {isExpanded && (
              <div className="px-3 mb-2">
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Admin Panel
                </small>
              </div>
            )}
            
            {/* Admin Menu Items */}
            {adminMenuItems.map(item => (
              <Nav.Item key={item.key}>
                <Nav.Link
                  eventKey={item.key}
                  active={isActive(item)}
                  onClick={() => handleNavigation(item)}
                  className="d-flex align-items-center mb-2 px-3 py-2"
                  style={{ 
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    backgroundColor: isActive(item) ? '#ffc107' : 'transparent',
                    color: isActive(item) ? '#000' : 'inherit'
                  }}
                  title={!isExpanded ? item.label : ''}
                >
                  <span style={{ width: '20px', fontSize: '1.1rem' }}>
                    {item.icon}
                  </span>
                  {isExpanded && (
                    <span className="ms-3 fw-medium">{item.label}</span>
                  )}
                </Nav.Link>
              </Nav.Item>
            ))}
          </>
        )}
        </Nav>
      </div>

      {/* Logout Button at Bottom */}
      <div className="border-top p-3" style={{ flexShrink: 0 }}>
        <Button
          variant="outline-danger"
          size="sm"
          className={`w-100 d-flex align-items-center ${isExpanded ? 'justify-content-start' : 'justify-content-center'}`}
          onClick={onLogout}
          title={!isExpanded ? 'Logout' : ''}
        >
          <span style={{ width: '20px', fontSize: '1rem' }}>
            <FaSignOutAlt />
          </span>
          {isExpanded && (
            <span className="ms-3">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;