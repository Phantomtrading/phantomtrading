declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
      setAttributes: (attributes: Record<string, string>, callback: (error?: any) => void) => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
    tawkShouldBeVisible?: boolean;
  }
}

export {};
