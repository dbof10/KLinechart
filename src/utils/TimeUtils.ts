


export function isSpecificHour(epochMilliseconds: number, hour: string): boolean {
  const date = new Date(epochMilliseconds);
  const [hourStr, minuteStr, secondStr] = hour.split(':').map(str => parseInt(str, 10));
  return date.getHours() === hourStr && date.getMinutes() === minuteStr;
}
