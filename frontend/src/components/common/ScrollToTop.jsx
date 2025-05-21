import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Component that scrolls to top when the location (route) changes
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when the pathname changes
        window.scrollTo(0, 0);
    }, [pathname]);

    return null; // This component doesn't render anything
}

export default ScrollToTop; 