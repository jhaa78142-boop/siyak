import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook for smooth page transitions using the View Transitions API
 * Falls back to normal navigation if not supported
 */
export function useViewTransition() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to, options = {}) => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      navigate(to, options);
      return;
    }

    // Use View Transitions API for smooth transitions
    document.startViewTransition(() => {
      navigate(to, options);
    });
  }, [navigate]);

  return navigateWithTransition;
}
