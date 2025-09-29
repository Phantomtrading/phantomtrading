import { useEffect } from 'react';
import { initTawk } from '../domain/usecases/initTawk';

interface TawkWidgetProps {
  propertyId: string;
  widgetId: string;
  name?: string;
  email?: string;
  userId?: string;
}

const TawkWidget: React.FC<TawkWidgetProps> = ({ propertyId, widgetId, name, email, userId }) => {
  useEffect(() => {
    // Set a flag to indicate Tawk should be visible
    window.tawkShouldBeVisible = true;
    initTawk(propertyId, widgetId);

    function setUserInfo() {
      if (window.Tawk_API && (name || email || userId)) {
        const attributes: Record<string, string> = {};
        if (name) attributes.name = name;
        if (email) attributes.email = email;
        if (userId) attributes.id = userId;
        window.Tawk_API.setAttributes(attributes, function ( ) {});
      }
    }

    // Attach to onLoad so it runs after widget is ready
    if (typeof window !== 'undefined') {
      if (!window.Tawk_API) {
        window.Tawk_API = {
          hideWidget: () => {},
          showWidget: () => {},
          setAttributes: () => {},
        };
      }
      const prevOnLoad = window.Tawk_API.onLoad;
      window.Tawk_API.onLoad = function () {
        if (typeof prevOnLoad === 'function') prevOnLoad();
        setUserInfo();
      };
    }

    return () => {
      // Set flag to indicate Tawk should be hidden when component unmounts
      window.tawkShouldBeVisible = false;
      // Don't destroy immediately, let the global manager handle it
    };
  }, [propertyId, widgetId, name, email, userId]);

  return null;
};

export default TawkWidget;
