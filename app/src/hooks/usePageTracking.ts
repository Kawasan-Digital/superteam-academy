import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics';

/**
 * Track page views on route changes.
 * Place this component once inside BrowserRouter.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname, document.title);
  }, [location.pathname]);
}
