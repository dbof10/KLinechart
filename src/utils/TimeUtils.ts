


export function isSpecificHour(epochMilliseconds: number, hour: string): boolean {
  const date = new Date(epochMilliseconds);
  const [hourStr, minuteStr, secondStr] = hour.split(':').map(str => parseInt(str, 10));
  return date.getHours() === hourStr && date.getMinutes() === minuteStr;
}


export function areSameDay(epochMilliseconds1: number, epochMilliseconds2: number): boolean {
  const date1 = new Date(epochMilliseconds1);
  const date2 = new Date(epochMilliseconds2);
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
