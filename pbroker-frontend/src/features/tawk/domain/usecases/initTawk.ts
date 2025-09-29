import { loadTawkScript, removeTawkScript } from '../../data/tawkService';

export const initTawk = (propertyId: string, widgetId: string): void => {
  loadTawkScript(propertyId, widgetId);
};

export const destroyTawk = (): void => {
  removeTawkScript();
};

export const hideTawkWidget = (): void => {
  // Remove the widget container from DOM
  const tawkContainer = document.querySelector('#tawkto-container');
  if (tawkContainer) {
    tawkContainer.remove();
  }
  
  // Also hide using API if available
  if (window.Tawk_API) {
    window.Tawk_API.hideWidget();
  }
  
  // Set flag to indicate Tawk should be hidden
  window.tawkShouldBeVisible = false;
};

export const showTawkWidget = (): void => {
  // Set flag to indicate Tawk should be visible
  window.tawkShouldBeVisible = true;
  
  // Show using API if available
  if (window.Tawk_API) {
    window.Tawk_API.showWidget();
  }
};
