import React, { useEffect } from 'react';



interface TawkToWidgetProps {
  userData?: {
    name?: string;
    email?: string;
  };
}

const TawkToWidget: React.FC<TawkToWidgetProps> = ({ userData }) => {
  useEffect(() => {
    // Initialize Tawk.to
    if (!window.Tawk_API) {
      window.Tawk_API = {
        hideWidget: () => {},
        showWidget: () => {},
        setAttributes: () => {},
      };
    }
    window.Tawk_LoadStart = new Date();

    // Create and append the script
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68512c5953810b190ffa393c/1ituhagam';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);

    // Configure Tawk.to
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = function() {
        if (userData && window.Tawk_API) {
          window.Tawk_API.setAttributes({
            'name': userData.name || 'Guest',
            'email': userData.email || '',
          }, function(error: any) {
            console.log('Error setting attributes:', error);
          });
        }
      };
    }

    return () => {
      // Cleanup
      if (s0.parentNode) {
        s0.parentNode.removeChild(s1);
      }
      // Hide the widget when component unmounts
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [userData]);

  return null;
};

export default TawkToWidget; 