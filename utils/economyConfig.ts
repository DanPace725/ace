export const economyRates = {
  profile: {
    xpPerHour: 100,
    hourlyCreditRate: 7.25,
    taskCreditPerXp: 0.0725,
  },
  room: {
    cleanHourly: 0.00035,
    needsAttentionHourly: -0.00005,
    messyHourly: -0.00015,
    criticalHourly: -0.0003,
    dailyLossCap: 0.005,
  },
  responsibility: {
    graceHours: 2,
    delayHourly: -0.001,
    taskDelayCap: 0.03,
  },
  completion: {
    baseRoomRewardRate: 0.02,
    fastMultiplier: 1.25,
    normalMultiplier: 1,
    lateMultiplier: 0.5,
    veryLateMultiplier: 0,
  },
  house: {
    cleanHourly: 0.00015,
    needsAttentionHourly: 0,
    messyHourly: -0.00005,
    criticalHourly: -0.0001,
    dividendRate: 0.02,
    dailyLossCap: 0.002,
  },
} as const;

export const creditEconomy = {
  creditDollarValue: 1,
  roomSettlementIntervalHours: 24,
} as const;

export const roomStateLabels = {
  clean: 'Clean',
  needs_attention: 'Needs attention',
  messy: 'Messy',
  critical: 'Critical',
} as const;

export const roomStateHourlyRates = {
  clean: economyRates.room.cleanHourly,
  needs_attention: economyRates.room.needsAttentionHourly,
  messy: economyRates.room.messyHourly,
  critical: economyRates.room.criticalHourly,
} as const;

interface ProjectedBalanceInput {
  balance?: number | null;
  state: keyof typeof roomStateHourlyRates;
  lastSettledAt?: string | null;
  now?: Date;
}

export const calculateProjectedRoomBalance = ({
  balance,
  state,
  lastSettledAt,
  now = new Date(),
}: ProjectedBalanceInput) => {
  const startingBalance = Math.max(Number(balance ?? 0), 0);
  const settledAt = lastSettledAt ? new Date(lastSettledAt) : now;
  const elapsedMs = Math.max(now.getTime() - settledAt.getTime(), 0);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (startingBalance === 0 || elapsedHours === 0) {
    return {
      balance: startingBalance,
      delta: 0,
      elapsedHours,
      rate: roomStateHourlyRates[state],
    };
  }

  const rate = roomStateHourlyRates[state];
  const compoundedBalance = startingBalance * Math.pow(1 + rate, elapsedHours);
  const dailyCap = economyRates.room.dailyLossCap;
  const maxLoss = startingBalance * dailyCap * (elapsedHours / 24);
  const cappedBalance = rate < 0
    ? Math.max(compoundedBalance, startingBalance - maxLoss, 0)
    : compoundedBalance;
  const projectedBalance = Math.max(cappedBalance, 0);

  return {
    balance: projectedBalance,
    delta: projectedBalance - startingBalance,
    elapsedHours,
    rate,
  };
};
