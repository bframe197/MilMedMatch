
import { Role } from '../types';

/**
 * Generates a deterministic 11-digit code based on role and current month/year.
 * This ensures codes change on the 1st of every month but remain stable for the duration of that month.
 */
export const getMonthlyAccessCode = (role: Role): string => {
  const d = new Date();
  const monthKey = d.getFullYear() * 12 + d.getMonth();
  
  // Create a seed based on the role name and the current month/year
  const roleStr = role.toString();
  let seed = monthKey;
  for (let i = 0; i < roleStr.length; i++) {
    seed = ((seed << 5) - seed) + roleStr.charCodeAt(i);
    seed |= 0; // Convert to 32bit integer
  }

  // Simple LCG for deterministic "random" digits
  const generateDigit = (s: number) => {
    const nextSeed = (s * 1664525 + 1013904223) % 4294967296;
    return { digit: Math.abs(nextSeed % 10), newSeed: nextSeed };
  };

  let currentSeed = seed;
  let code = "";
  for (let i = 0; i < 11; i++) {
    const { digit, newSeed } = generateDigit(currentSeed);
    code += digit.toString();
    currentSeed = newSeed;
  }

  return code;
};

export const PORTAL_CREDENTIALS = {
  username: 'code##',
  accessCode: '10203040506'
};
