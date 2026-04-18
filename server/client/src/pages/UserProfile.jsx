import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  ArrowLeft,
  LogOut,
  Edit,
  X,
  Loader,
} from 'lucide-react';

/**
 * User Profile Page
 * Displays and allows editing of logged-in user's profile from MongoDB
 * Production-grade implementation with database integration
 */
const UserProfile = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State Management
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    institution: '',
    profileImage: '',
    userType: 'student',
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Authentication check and data fetch
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Fetch user profile from server
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getMe();
        
        if (response.success && response.user) {
          setProfileData({
            fullName: response.user.fullName || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            bio: response.user.bio || '',
            institution: response.user.institution || '',
            profileImage: response.user.profileImage || '',
            userType: response.user.userType || 'student',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  // Handle profile input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes to database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // Validation
      if (!profileData.fullName.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Full name is required',
          variant: 'destructive',
        });
        return;
      }

      const response = await authAPI.updateProfile(profileData);

      if (response.success) {
        toast({
          title: '✅ Success',
          description: 'Profile updated successfully!',
        });
        setEditMode(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      setPasswordLoading(true);

      // Validation
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all password fields',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast({
          title: 'Validation Error',
          description: 'New password must be at least 6 characters',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Validation Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      const response = await authAPI.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      if (response.success) {
        toast({
          title: '✅ Success',
          description: 'Password changed successfully!',
        });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">User Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="gap-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6">
              <div className="flex flex-col items-center">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt={profileData.fullName}
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-primary"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4 border-4 border-primary">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-foreground text-center">{profileData.fullName}</h2>
                <p className="text-sm text-muted-foreground mt-1 capitalize">{profileData.userType}</p>
                <p className="text-sm text-muted-foreground text-center mt-4">{profileData.email}</p>

                {editMode && (
                  <Input
                    type="url"
                    name="profileImage"
                    placeholder="Profile image URL"
                    value={profileData.profileImage}
                    onChange={handleInputChange}
                    className="mt-4 text-sm"
                  />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Profile Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Profile Information</h3>
                {!editMode && (
                  <Button
                    onClick={() => setEditMode(true)}
                    className="gap-2 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  {editMode ? (
                    <Input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="rounded-lg"
                      placeholder="Enter your full name"
                      required
                    />
                  ) : (
                    <p className="text-foreground py-2">{profileData.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <p className="text-foreground py-2">{profileData.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  {editMode ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="rounded-lg"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-foreground py-2">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    <Building2 className="inline w-4 h-4 mr-2" />
                    Institution / Company
                  </label>
                  {editMode ? (
                    <Input
                      type="text"
                      name="institution"
                      value={profileData.institution}
                      onChange={handleInputChange}
                      className="rounded-lg"
                      placeholder="Your institution or company"
                    />
                  ) : (
                    <p className="text-foreground py-2">{profileData.institution || 'Not provided'}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Bio / About
                  </label>
                  {editMode ? (
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="rounded-lg min-h-24"
                      placeholder="Tell us about yourself (max 500 characters)"
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-foreground py-2">{profileData.bio || 'Not provided'}</p>
                  )}
                  {editMode && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {profileData.bio.length}/500 characters
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {editMode && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 gap-2 rounded-lg bg-primary hover:bg-primary/90"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setEditMode(false)}
                      variant="outline"
                      className="flex-1 gap-2 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Security Section */}
            <Card className="p-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Security Settings</h3>
              </div>

              {!showPasswordForm && (
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="outline"
                  className="gap-2 rounded-lg"
                >
                  Change Password
                </Button>
              )}

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Current Password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({
                        ...prev,
                        oldPassword: e.target.value
                      }))
                    }
                    className="rounded-lg"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))
                    }
                    className="rounded-lg"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))
                    }
                    className="rounded-lg"
                    required
                  />
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 gap-2 rounded-lg"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      variant="outline"
                      className="flex-1 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;
