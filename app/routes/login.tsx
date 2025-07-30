import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function meta() {
  return [
    { title: "Login - Aksamedia" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
      general: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ username: "", password: "", general: "" });

    try {
      const success = await login(formData.username, formData.password);

      if (success) {
        navigate("/", { replace: true });
      } else {
        setErrors({
          username: "",
          password: "",
          general: "Invalid username or password",
        });
      }
    } catch (error) {
      setErrors({
        username: "",
        password: "",
        general: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: "username" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear errors when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
      if (errors.general) {
        setErrors({ ...errors, general: "" });
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-800 dark:text-gray-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Welcome back to Aksamedia
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleInputChange("username")}
                error={errors.username}
                placeholder="Enter your username"
                autoComplete="username"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
            </div>

            {errors.general && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500 dark:text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {errors.general}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-semibold"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo Credentials
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Username:</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">admin</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Password:</span>
                  <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">pastibisa</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
