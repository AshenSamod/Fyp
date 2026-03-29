import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/my-ideas') return 'my-ideas';
    if (path === '/my-commented-ideas') return 'my-commented-ideas';
    if (path === '/profile') return 'profile';
    if (path.startsWith('/ideas/new')) return 'new-idea';
    return 'dashboard';
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSidebarExpand = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSidebar && window.innerWidth < 992) {
        const sidebar = document.querySelector('.sidebar-mobile');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');
        if (sidebar && !sidebar.contains(event.target) && !toggleBtn?.contains(event.target)) {
          setShowSidebar(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      {/* Mobile Navbar */}
      <Navbar showSidebar={showSidebar} onToggleSidebar={toggleSidebar} />

      <div className="dashboard-content">
        {/* Desktop Sidebar */}
        <div 
          className={`sidebar-desktop d-none d-lg-block ${sidebarExpanded ? 'expanded' : 'collapsed'}`}
        >
          <Sidebar 
            activeTab={getActiveTab()}
            onTabChange={() => {}}
            onLogout={onLogout}
            isExpanded={sidebarExpanded}
            onToggleExpand={toggleSidebarExpand}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`sidebar-mobile d-lg-none ${showSidebar ? 'show' : ''}`}>
          <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
          <div className="sidebar-content">
            <Sidebar 
              activeTab={getActiveTab()}
              onTabChange={() => {}}
              onLogout={onLogout}
              isExpanded={true}
              onToggleExpand={() => {}}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
