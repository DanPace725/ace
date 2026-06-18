export const adminUnlockSessionKey = 'ace-admin-unlocked';

export const isValidAdminPin = (pin: string) => /^\d{4}$/.test(pin);

export const lockAdminSession = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(adminUnlockSessionKey);
};

export const unlockAdminSession = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(adminUnlockSessionKey, 'true');
};

export const isAdminSessionUnlocked = () => (
  typeof window !== 'undefined' &&
  window.sessionStorage.getItem(adminUnlockSessionKey) === 'true'
);
