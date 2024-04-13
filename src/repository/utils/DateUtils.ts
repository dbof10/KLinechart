

export function formatDate(timestampInMillis: number): string {
  const date = new Date(timestampInMillis);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-GB', options);
}
