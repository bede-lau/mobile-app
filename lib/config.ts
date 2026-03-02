// ─── App Configuration ──────────────────────────────────────────────────────

export const config = {
  MOCK_MODE: process.env.EXPO_PUBLIC_MOCK_MODE === 'true',
  API_TIMEOUT: 10000,
  DEBUG: __DEV__,
} as const;

export const isMockMode = () => config.MOCK_MODE;

export const logMock = (message: string, data?: unknown) => {
  if (config.DEBUG && config.MOCK_MODE) {
    console.log(`[MOCK] ${message}`, data ?? '');
  }
};
