import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'circular':
        return { width: width || '40px', height: height || '40px' };
      case 'rectangular':
        return { width: width || '100%', height: height || '20px' };
      case 'text':
      default:
        return { width: width || '100%', height: height || '16px' };
    }
  };

  const dimensions = getDefaultDimensions();

  const style = {
    width: dimensions.width,
    height: dimensions.height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Predefined skeleton components for common use cases
export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <Skeleton width="120px" height="16px" />
      </td>
      <td className="px-4 py-3">
        <Skeleton width="160px" height="16px" />
      </td>
      <td className="px-4 py-3">
        <Skeleton width="100px" height="16px" />
      </td>
      <td className="px-4 py-3">
        <Skeleton width="80px" height="16px" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end space-x-2">
          <Skeleton width="60px" height="32px" />
          <Skeleton width="60px" height="32px" />
        </div>
      </td>
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton lines={3} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg animate-pulse">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Skeleton variant="rectangular" width="32px" height="32px" className="rounded-md" />
          </div>
          <div className="ml-4 flex-1">
            <Skeleton width="80%" height="14px" className="mb-2" />
            <Skeleton width="40%" height="24px" />
          </div>
        </div>
      </div>
    </div>
  );
}
