import React, { useEffect, useRef, useState } from "react";
import type { DropdownItem } from "~/types";

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Fixed: Added initial value
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Fixed: Added proper typing

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Small delay to show the click effect
    timeoutRef.current = setTimeout(() => {
      item.onClick();
      setIsOpen(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            className={`
              absolute z-50 mt-2 w-56 rounded-lg shadow-lg
              bg-white dark:bg-gray-800
              ring-1 ring-black/5 dark:ring-white/10
              border border-gray-200 dark:border-gray-700
              focus:outline-none
              transform transition-all duration-200 ease-out
              origin-top-right scale-100 opacity-100
              ${align === "right" ? "right-0" : "left-0"}
            `}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            style={{
              backgroundColor: "var(--dropdown-bg)",
              borderColor: "var(--dropdown-border)",
            }}
          >
            <div className="py-1" role="none">
              {items.map((item, index) => (
                <button
                  key={index}
                  className={`
                    dropdown-item group flex items-center px-4 py-3 text-sm w-full text-left
                    transition-all duration-150 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                    ${
                      item.danger
                        ? "dropdown-danger text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-200"
                        : "dropdown-normal text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    }
                    active:scale-95
                  `}
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <span
                      className={`mr-3 flex-shrink-0 transition-colors duration-150 ${
                        item.danger
                          ? "text-red-500 group-hover:text-red-600 dark:text-red-300 dark:group-hover:text-red-200"
                          : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
