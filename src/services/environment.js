// src/services/environment.js

/**
 * Determines the application's current running environment.
 * It checks Vercel's system environment variable to distinguish between
 * production, preview, and local development environments.
 *
 * @returns {'PROD' | 'test' | 'dev'} The environment identifier.
 *    - 'PROD': For Vercel production deployments.
 *    - 'test': For Vercel preview deployments.
 *    - 'dev':  For local development (e.g., via `npm run dev`).
 */
const getAppEnv = () => {
  const vercelEnv = import.meta.env.VITE_VERCEL_ENV;
  if (vercelEnv === 'production') {
    return 'PROD'; // Vercel Production
  }
  if (vercelEnv === 'preview') {
    return 'test'; // Vercel Preview
  }
  return 'dev'; // Local development
};

/**
 * A constant representing the current application environment.
 * Import this constant across the application to ensure consistent
 * environment-specific logic.
 */
export const APP_ENV = getAppEnv();

/**
 * Temporary stake limit configuration
 * Set to true to enable the 10 OSK per-user stake limit
 * Set to false to remove this limit (use only contract's maxStakeAmount)
 */
export const ENABLE_TEMPORARY_STAKE_LIMIT = false;

/**
 * The temporary maximum stake amount per user (in OSK)
 * Only applies when ENABLE_TEMPORARY_STAKE_LIMIT is true
 */
export const TEMPORARY_STAKE_LIMIT = 10;

/**
 * Enable single purchase limit configuration
 */
export const ENABLE_SINGLE_PURCHASE_LIMIT = false;

/**
 * Single purchase limit configuration
 * The maximum amount (in OSK) for a single stake transaction.
 */
export const SINGLE_PURCHASE_LIMIT = 0.5;

/**
 * Enable staking queue frequency control
 */
export const ENABLE_STAKING_QUEUE = false;

/**
 * Disable console logs in production
 * Set to true to disable console.log/debug/info in production environment
 */
export const DISABLE_CONSOLE_IN_PROD = true;

/**
 * Time Unit Configuration
 * Determines whether to display staking duration in minutes or days.
 * Useful for test/dev environments where contracts might have shorter durations.
 * Set to 'minute' for minute-based display, 'day' for day-based display.
 */
export const TIME_UNIT_CONFIG = (APP_ENV === 'test' || APP_ENV === 'dev') ? 'day' : 'day';

/**
 * Stake Durations Configuration (in seconds)
 * Defines the duration for each stake index (0-4).
 */
const STAKE_DURATIONS_MINUTE = [420, 900, 1800, 2700, 60]; // 7, 15, 30, 45, 60 minutes
const STAKE_DURATIONS_DAY = [604800, 1296000, 2592000, 3888000, 5184000]; // 7, 15, 30, 45, 60 days

export const STAKE_DURATIONS = TIME_UNIT_CONFIG === 'minute' ? STAKE_DURATIONS_MINUTE : STAKE_DURATIONS_DAY;


