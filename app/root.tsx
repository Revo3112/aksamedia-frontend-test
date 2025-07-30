import React, { useState, useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
} from "react-router";
import type { Route } from "./+types/root";
import { AuthProvider } from "./context/AuthContext";
import { CrudProvider } from "./context/CrudContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { useAuth } from "./context/AuthContext";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

/* Enhanced blocking script to prevent FOUC and hydration mismatch */
const themeScript = `
  (function(){
    try {
      console.log('Theme initialization script running...');
      const themePreference = localStorage.getItem('theme_preference') || 'system';
      const root = document.documentElement;

      function applyTheme(theme) {
        console.log('Applying theme via script:', theme);
        if (theme === 'dark') {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        } else {
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
        }
      }

      if (themePreference === 'system') {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(isDark ? 'dark' : 'light');
      } else {
        applyTheme(themePreference);
      }

      console.log('Theme initialization completed');
    } catch (e) {
      console.error('Theme initialization error:', e);
      // Fallback to light theme if there's any error
      const root = document.documentElement;
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  })();
`;

/* App Layout with theme synchronization */
// ConditionalCrudProvider - Only render CrudProvider when authenticated
function ConditionalCrudProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't render CrudProvider until we know auth status
  if (isLoading) {
    return <>{children}</>;
  }

  // Only render CrudProvider if user is authenticated
  if (isAuthenticated) {
    return <CrudProvider>{children}</CrudProvider>;
  }

  // For non-authenticated users, just render children directly
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isAuthenticated && <Navbar />}
      <main
        className={
          isAuthenticated
            ? "max-w-7xl mx-auto px-4 py-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
            : "bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
        }
      >
        {children}
      </main>
    </div>
  );
}

/* Enhanced Loading Component */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/* Error Boundary Component */
function ErrorPage({ message, details }: { message: string; details: string }) {
  return (
    <html lang="en" data-theme="light" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Aksamedia</title>
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 h-full">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full text-center px-4">
            <div className="mb-8">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {message}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{details}</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

/* Layout for server and client */
export function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <html lang="en" data-theme="light" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="antialiased bg-gray-50 dark:bg-gray-900 h-full transition-colors">
          <LoadingScreen />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 h-full transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <ConditionalCrudProvider>
              <AppLayout>{children}</AppLayout>
            </ConditionalCrudProvider>
          </AuthProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

/* Enhanced loader with better error handling */
export function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const authData = JSON.parse(localStorage.getItem("user_data") || "{}");
    const pathname = new URL(request.url).pathname;

    const isAuthenticated = authData?.username;

    if (!isAuthenticated && pathname !== "/login") {
      throw redirect("/login");
    }

    if (isAuthenticated && pathname === "/login") {
      throw redirect("/");
    }

    return null;
  } catch (error) {
    if (error instanceof Response) {
      throw error; // Re-throw redirect responses
    }

    // Handle JSON parsing errors or other issues
    const pathname = new URL(request.url).pathname;
    if (pathname !== "/login") {
      throw redirect("/login");
    }

    return null;
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops! Something went wrong";
  let details = "An unexpected error occurred. Please try refreshing the page.";

  if (isRouteErrorResponse(error)) {
    message = "Page Not Found";
    details = "The page you are looking for does not exist.";
  } else if (error instanceof Error) {
    details = error.message;
  }

  return <ErrorPage message={message} details={details} />;
}
