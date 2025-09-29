export const loadTawkScript = (propertyId: string, widgetId: string): void => {
    if (document.getElementById('tawk-script')) return;
  
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
  };
  
  export const removeTawkScript = (): void => {
    const script = document.getElementById('tawk-script');
    if (script) {
      script.remove();
    }
  };
  