


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


export function areSameHourAndMinute(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const hour1 = date1.getHours();
  const minute1 = date1.getMinutes();
  const hour2 = date2.getHours();
  const minute2 = date2.getMinutes();

  return hour1 === hour2 && minute1 === minute2;
}

export function isAfterMinute(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const hour1 = date1.getHours();
  const minute1 = date1.getMinutes();
  const hour2 = date2.getHours();
  const minute2 = date2.getMinutes();

  if (hour1 > hour2) {
    return true;
  } else return hour1 === hour2 && minute1 > minute2;
}
