import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';


export function meta() {
  return [
    { title: 'Edit Profile - Aksamedia' },
    { name: 'description', content: 'Edit your profile information' },
  ];
}

export default function Profile() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user) {
      setFormData({
        fullName: user.fullName,
      });
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const newErrors = {
      fullName: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return !newErrors.fullName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ fullName: '' });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      updateUser({ fullName: formData.fullName.trim() });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrors({
        fullName: 'An error occurred while updating your profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ fullName: e.target.value });
    // Clear errors when user starts typing
    if (errors.fullName) {
      setErrors({ fullName: '' });
    }
    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  // Don't render anything while checking authentication
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="px-6 py-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Profile
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Update your personal information and preferences.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Input
                      label="Username"
                      type="text"
                      value={user.username}
                      disabled
                      helperText="Username cannot be changed"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                  </div>

                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      error={errors.fullName}
                      placeholder="Enter your full name"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </div>
                </div>

                {showSuccess && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Profile updated successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>

              {/* User Info Card */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Current Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Username
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user.username}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Full Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user.fullName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        User ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
