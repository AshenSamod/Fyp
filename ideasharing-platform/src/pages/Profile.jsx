import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaCalendar, FaKey, FaSave, FaTimes, FaUserShield, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { useAuth } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    bio: ''
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  // Password form state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getProfile();
      setProfileData(response.data.user);
      setProfileForm({
        full_name: response.data.user.full_name || '',
        email: response.data.user.email || '',
        bio: response.data.user.bio || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.updateProfile(profileForm);
      setProfileData(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordUpdateLoading(true);

    try {
      await api.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsChangingPassword(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      full_name: profileData?.full_name || '',
      email: profileData?.email || '',
      bio: profileData?.bio || ''
    });
    setError('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordError('');
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteAccountConfirm = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required to delete your account');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await api.deleteAccount(deletePassword);
      
      // Show success message with details
      const { ideas_deleted, comments_deleted } = response.data.details || {};
      alert(
        `Account deleted successfully!\n\n` +
        `${ideas_deleted || 0} ideas deleted\n` +
        `${comments_deleted || 0} comments deleted`
      );

      // Logout and redirect to login page
      logout();
      navigate('/auth');
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container fluid className="p-3 p-md-4">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p className="mt-3 text-muted small">Loading profile...</p>
        </div>
      ) : (
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={9}>
            <Row className="g-3 g-md-4">
              {/* Profile Header Card - Full Width */}
              <Col xs={12}>
                <Card className="shadow-sm border-0 mb-0">
                  <Card.Body className="p-3 p-md-4 text-center">
                    <div className="mb-3">
                      <div 
                        className="rounded-circle bg-primary bg-gradient d-inline-flex align-items-center justify-content-center text-white"
                        style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                      >
                        {profileData?.is_admin ? <FaUserShield /> : <FaUser />}
                      </div>
                    </div>
                    <h4 className="mb-1">{profileData?.full_name}</h4>
                    {/* <p className="text-muted mb-2 small">@{profileData?.username}</p> */}
                    {profileData?.is_admin && (
                      <div className="d-inline-block mb-2">
                        <span className="badge bg-warning text-dark px-2 py-1 small">
                          <FaUserShield className="me-1" />
                          Administrator
                        </span>
                      </div>
                    )}
                    {!profileData?.is_admin && (
                      <div className="d-inline-block mb-2">
                        <span className="badge bg-secondary px-2 py-1 small">
                          {profileData?.role 
                            ? profileData.role === 'idea_creator' 
                              ? 'Idea Creator'
                              : profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)
                            : 'Standard User'
                          }
                        </span>
                      </div>
                    )}
                    <div className="text-muted small">
                      <FaCalendar className="me-1" style={{ fontSize: '0.85rem' }} />
                      Member since {formatDate(profileData?.created_at)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Profile Information Card */}
                    <Col xs={12} md={12}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 py-3 px-3 px-md-4">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                            <h6 className="mb-0 fw-bold">
                              <FaUser className="me-2 text-primary" />
                              Profile Information
                            </h6>
                            {!isEditingProfile && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => setIsEditingProfile(true)}
                                className="px-3"
                              >
                                Edit Profile
                              </Button>
                            )}
                          </div>
                        </Card.Header>
                        <Card.Body className="p-3 p-md-4">
                          {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">{error}</Alert>}
                          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3">{success}</Alert>}

                          {!isEditingProfile ? (
                            // View Mode
                            <div>
                              <Row className="g-3">
                                {/* <Col xs={12} sm={6}>
                                  <div className="p-3 bg-light rounded">
                                    <label className="text-muted small mb-1 d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Username</label>
                                    <div className="fw-medium">{profileData?.username}</div>
                                  </div>
                                </Col> */}

                                <Col xs={12} sm={6}>
                                  <div className="p-3 bg-light rounded">
                                    <label className="text-muted small mb-1 d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Full Name</label>
                                    <div className="fw-medium">{profileData?.full_name || 'Not provided'}</div>
                                  </div>
                                </Col>

                                <Col xs={12} sm={6}>
                                  <div className="p-3 bg-light rounded">
                                    <label className="text-muted small mb-1 d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                      <FaEnvelope className="me-1" />
                                      Email Address
                                    </label>
                                    <div className="fw-medium">{profileData?.email}</div>
                                  </div>
                                </Col>

                                <Col xs={12}>
                                  <div className="p-3 bg-light rounded">
                                    <label className="text-muted small mb-1 d-block text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Bio</label>
                                    <div className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                                      {profileData?.bio || <em className="text-muted">No bio provided</em>}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ) : (
                            // Edit Mode
                            <Form onSubmit={handleProfileUpdate}>
                              <Row className="g-3">
                                {/* <Col xs={12}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Username</Form.Label>
                                    <Form.Control 
                                      type="text" 
                                      value={profileData?.username || ''}
                                      disabled
                                      className="bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                      Username cannot be changed
                                    </Form.Text>
                                  </Form.Group>
                                </Col> */}

                                <Col xs={12} md={6}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Full Name</Form.Label>
                                    <Form.Control 
                                      type="text" 
                                      name="full_name"
                                      value={profileForm.full_name}
                                      onChange={handleProfileInputChange}
                                      placeholder="Enter your full name"
                                      required
                                    />
                                  </Form.Group>
                                </Col>

                                <Col xs={12} md={6}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Email Address</Form.Label>
                                    <Form.Control 
                                      type="email" 
                                      name="email"
                                      value={profileForm.email}
                                      onChange={handleProfileInputChange}
                                      placeholder="Enter your email"
                                      required
                                    />
                                  </Form.Group>
                                </Col>

                                <Col xs={12}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Bio</Form.Label>
                                    <Form.Control 
                                      as="textarea" 
                                      rows={3}
                                      name="bio"
                                      value={profileForm.bio}
                                      onChange={handleProfileInputChange}
                                      placeholder="Tell us about yourself..."
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                                <Button 
                                  variant="primary" 
                                  type="submit"
                                  disabled={profileUpdateLoading}
                                  size="sm"
                                  className="px-3"
                                >
                                  {profileUpdateLoading ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <FaSave className="me-2" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  onClick={handleCancelEdit}
                                  disabled={profileUpdateLoading}
                                  size="sm"
                                  className="px-3"
                                >
                                  <FaTimes className="me-2" />
                                  Cancel
                                </Button>
                              </div>
                            </Form>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Change Password Card */}
                    <Col xs={12} md={12}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 py-3 px-3 px-md-4">
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                            <h6 className="mb-0 fw-bold">
                              <FaKey className="me-2 text-primary" />
                              Security Settings
                            </h6>
                            {!isChangingPassword && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => setIsChangingPassword(true)}
                                className="px-3"
                              >
                                Change Password
                              </Button>
                            )}
                          </div>
                        </Card.Header>
                        <Card.Body className="p-3 p-md-4">
                          {passwordError && <Alert variant="danger" dismissible onClose={() => setPasswordError('')} className="mb-3">{passwordError}</Alert>}
                          {passwordSuccess && <Alert variant="success" dismissible onClose={() => setPasswordSuccess('')} className="mb-3">{passwordSuccess}</Alert>}

                          {!isChangingPassword ? (
                            <div className="text-center text-md-start p-3 bg-light rounded">
                              <FaKey className="text-primary mb-2" style={{ fontSize: '1.5rem' }} />
                              <p className="text-muted mb-0 small" style={{ lineHeight: '1.6' }}>
                                Keep your account secure by regularly updating your password. 
                                Use a strong password with at least 6 characters.
                              </p>
                            </div>
                          ) : (
                            <Form onSubmit={handlePasswordChange}>
                              <Row className="g-3">
                                <Col xs={12}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Current Password</Form.Label>
                                    <Form.Control 
                                      type="password" 
                                      name="old_password"
                                      value={passwordForm.old_password}
                                      onChange={handlePasswordInputChange}
                                      placeholder="Enter your current password"
                                      required
                                    />
                                  </Form.Group>
                                </Col>

                                <Col xs={12} md={6}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">New Password</Form.Label>
                                    <Form.Control 
                                      type="password" 
                                      name="new_password"
                                      value={passwordForm.new_password}
                                      onChange={handlePasswordInputChange}
                                      placeholder="Enter new password (min. 6 characters)"
                                      required
                                      minLength={6}
                                    />
                                  </Form.Group>
                                </Col>

                                <Col xs={12} md={6}>
                                  <Form.Group>
                                    <Form.Label className="fw-semibold small">Confirm New Password</Form.Label>
                                    <Form.Control 
                                      type="password" 
                                      name="confirm_password"
                                      value={passwordForm.confirm_password}
                                      onChange={handlePasswordInputChange}
                                      placeholder="Confirm new password"
                                      required
                                      minLength={6}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                                <Button 
                                  variant="primary" 
                                  type="submit"
                                  disabled={passwordUpdateLoading}
                                  size="sm"
                                  className="px-3"
                                >
                                  {passwordUpdateLoading ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <FaKey className="me-2" />
                                      Update Password
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  onClick={handleCancelPasswordChange}
                                  disabled={passwordUpdateLoading}
                                  size="sm"
                                  className="px-3"
                                >
                                  <FaTimes className="me-2" />
                                  Cancel
                                </Button>
                              </div>
                            </Form>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Delete Account Card */}
                    <Col xs={12} md={12}>
                      <Card className="shadow-sm border-danger h-100">
                        <Card.Header className="bg-white border-0 py-3 px-3 px-md-4">
                          <h6 className="mb-0 fw-bold text-danger">
                            <FaExclamationTriangle className="me-2" />
                            Danger Zone
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3 p-md-4">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                            <div>
                              <h6 className="fw-bold mb-2">Delete Account</h6>
                              <p className="text-muted mb-0 small" style={{ lineHeight: '1.6' }}>
                                Permanently delete your account and all associated data. This action cannot be undone.
                                All your ideas and comments will be removed from the platform.
                              </p>
                            </div>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={handleDeleteAccountClick}
                              className="px-3 flex-shrink-0"
                            >
                              <FaTrash className="me-2" />
                              Delete Account
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}

      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCancelDeleteAccount} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center h5">
            <FaExclamationTriangle className="me-2" />
            Delete Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              {deleteError}
            </Alert>
          )}
          
          <Alert variant="danger" className="mb-3">
            <strong>Warning!</strong> This action is permanent and cannot be undone.
          </Alert>

          <p className="mb-3">
            Deleting your account will permanently remove:
          </p>
          <ul className="mb-3">
            <li>Your profile and personal information</li>
            <li>All your ideas and posts</li>
            <li>All your comments and replies</li>
            <li>All associated data</li>
          </ul>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Enter your password to confirm:
            </Form.Label>
            <Form.Control 
              type="password" 
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isDeleting}
            />
          </Form.Group>

          <p className="text-danger small mb-0">
            <strong>Are you absolutely sure you want to delete your account?</strong>
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleCancelDeleteAccount}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={handleDeleteAccountConfirm}
            disabled={isDeleting || !deletePassword}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Yes, Delete My Account
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
  );
};

export default Profile;
