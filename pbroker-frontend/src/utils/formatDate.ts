export const formatDate = (dateString: string, format?: string) => {
  const date = new Date(dateString);
  if (format === 'MM/dd') {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit'
    });
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 