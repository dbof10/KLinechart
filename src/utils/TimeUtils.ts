export function isSpecificHour(epochMilliseconds: number, hour: string): boolean {
  const date = new Date(epochMilliseconds);
  const [hourStr, minuteStr, secondStr] = hour.split(":").map(str => parseInt(str, 10));
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


export function areSameHourAndMinute(timestamp1: number, timestamp2: number, timeframe: number): boolean {
  const timeframeInMinute = timeframe / (60 * 1000);
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const hour1 = date1.getHours();
  const minute1 = date1.getMinutes();
  const hour2 = date2.getHours();
  const minute2 = date2.getMinutes();

  return hour1 === hour2 && ((minute1 - minute2) < timeframeInMinute);
}

export function isAfterMinute(timestamp1: number, timestamp2: number, timeframe: number): boolean {
  const timeframeInMinute = timeframe / (60 * 1000);

  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const hour1 = date1.getHours();
  const minute1 = date1.getMinutes();
  const hour2 = date2.getHours();
  const minute2 = date2.getMinutes();

  if (hour1 > hour2) {
    return true;
  } else return hour1 === hour2 && ((minute1 - minute2) >= timeframeInMinute);
}

export function timeFrameToMilliseconds(timeframe: string): number {
  if (timeframe.endsWith("M") || timeframe.endsWith("H")) {
    switch (timeframe) {
      case "1M":
        return 60 * 1000; // 1 minute
      case "3M":
        return 3 * 60 * 1000; // 3 minutes
      case "15M":
        return 15 * 60 * 1000; // 15 minutes
      case "1H":
        return 60 * 60 * 1000; // 1 hour
      case "4H":
        return 4 * 60 * 60 * 1000; // 4 hours
      default:
        return 0;
    }
  } else {
    return -1;
  }
}

export function areSameMinute(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  const hour1 = date1.getHours();
  const minute1 = date1.getMinutes();
  const hour2 = date2.getHours();
  const minute2 = date2.getMinutes();

  return hour1 === hour2 && minute1 == minute2;
}

export function formatTimestamp(milliseconds: number): string {
  const date = new Date(milliseconds);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const year = date.getFullYear();

  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}
