export interface TradingSettings  {
  drawSessionBreak: boolean,
  maxDaysToLoad: number,
  tradingHours: TradingHours
}

type TradingHours = {

  morningSession: {
    open: string
    close: string
  }
  afternoonSession: {
    enabled: boolean,
    open: string
    close: string
  }
}

export const defaultSettings: TradingSettings = {
  drawSessionBreak: true,
  maxDaysToLoad: 10,
  tradingHours: {
    morningSession: {
      open: "09:00:00",
      close: "11:30:00",
    },
    afternoonSession: {
      enabled: true,
      open: "13:00:00",
      close: "14:30:00",
    },
  },
};
