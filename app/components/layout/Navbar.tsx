import React from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Dropdown } from "../ui/Dropdown";
import type { DropdownItem } from "../../types";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
  const location = useLocation();

  console.log(
    "Navbar render - theme:",
    theme,
    "effectiveTheme:",
    effectiveTheme
  );

  /* ---------- Theme switch items with active states ---------- */
  const themeItems: DropdownItem[] = [
    {
      label: `Light ${theme === "light" ? "✓" : ""}`,
      onClick: () => {
        console.log("Light theme clicked from dropdown");
        setTheme("light");
      },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: `Dark ${theme === "dark" ? "✓" : ""}`,
      onClick: () => {
        console.log("Dark theme clicked from dropdown");
        setTheme("dark");
      },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
    {
      label: `System ${theme === "system" ? "✓" : ""}`,
      onClick: () => {
        console.log("System theme clicked from dropdown");
        setTheme("system");
      },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: "🔄 Toggle Theme",
      onClick: () => {
        console.log("Quick toggle clicked from dropdown");
        toggleTheme();
      },
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
  ];

  /* ---------- User dropdown items ---------- */
  const userItems: DropdownItem[] = [
    {
      label: "Edit Profile",
      onClick: () => {
        window.location.href = "/profile";
      },
      icon: (
        <svg
          className="w-4 h-4"
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
      ),
    },
    {
      label: "Logout",
      onClick: logout,
      danger: true,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  /* ---------- Current theme icon with enhanced visual feedback ---------- */
  const getThemeIcon = () => {
    const iconClasses = "w-5 h-5 transition-all duration-300 transform";
    const activeThemeColor =
      theme === "light"
        ? "text-yellow-500"
        : theme === "dark"
          ? "text-blue-400"
          : "text-gray-500 dark:text-gray-400";

    switch (theme) {
      case "light":
        return (
          <svg
            className={`${iconClasses} ${activeThemeColor} rotate-0`}
            fill="currentColor"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "dark":
        return (
          <svg
            className={`${iconClasses} ${activeThemeColor} rotate-12`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      case "system":
      default:
        return (
          <div className="relative">
            <svg
              className={`${iconClasses} ${activeThemeColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div
              className={`
                absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full transition-all duration-300 transform
                ${
                  effectiveTheme === "dark"
                    ? "bg-blue-400 dark:bg-blue-300 scale-100"
                    : "bg-yellow-400 scale-100"
                }
              `}
            />
          </div>
        );
    }
  };

  const linkClasses = (isActive: boolean) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border-blue-500 text-gray-900 dark:text-white"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-600"
    }`;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                Aksamedia
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={linkClasses(location.pathname === "/")}>
                Dashboard
              </Link>
              <Link
                to="/crud"
                className={linkClasses(location.pathname === "/crud")}
              >
                Employee Management
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Modern Theme Toggle Switch */}
            <div className="relative">
              <button
                onClick={() => {
                  const newTheme =
                    effectiveTheme === "light" ? "dark" : "light";
                  setTheme(newTheme);
                }}
                className="theme-toggle-switch cursor-pointer"
                aria-label={`Switch to ${effectiveTheme === "light" ? "dark" : "light"} mode`}
                title={`Currently ${effectiveTheme} mode. Click to switch to ${effectiveTheme === "light" ? "dark" : "light"} mode`}
              >
                {/* Toggle Switch Track */}
                <div
                  className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  ${effectiveTheme === "dark" ? "bg-blue-600" : "bg-gray-300"}
                `}
                >
                  {/* Toggle Switch Circle */}
                  <span
                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out
                    ${
                      effectiveTheme === "dark"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }
                  `}
                  >
                    {/* Icon inside circle */}
                    <div className="flex h-full w-full items-center justify-center">
                      {effectiveTheme === "dark" ? (
                        /* Moon icon for dark mode */
                        <svg
                          className="h-3 w-3 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          style={{
                            color: "rgb(156 163 175)",
                            fill: "rgb(156 163 175)",
                          }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        /* Sun icon for light mode */
                        <svg
                          className="h-3 w-3 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                          style={{
                            color: "rgb(234 179 8)",
                            fill: "rgb(234 179 8)",
                          }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </span>
                </div>
              </button>
            </div>

            {/* User Dropdown */}
            {user && (
              <Dropdown
                trigger={
                  <button className="flex items-center space-x-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group">
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                      <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {user.fullName}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 transition-all duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-300 transform group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                }
                items={userItems}
                align="right"
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                location.pathname === "/"
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/crud"
              className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                location.pathname === "/crud"
                  ? "bg-blue-50 border-r-4 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Employee Management
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
