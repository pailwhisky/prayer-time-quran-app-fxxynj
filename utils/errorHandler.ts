/**
 * Centralized Error Handler for My Prayer App
 * 
 * Provides consistent error classification, user-friendly messages,
 * retry logic for transient failures, and logging.
 */

// Error categories for proper handling and display
export enum ErrorCategory {
    NETWORK = 'network',
    LOCATION = 'location',
    AUTHENTICATION = 'auth',
    SUBSCRIPTION = 'subscription',
    AI_SERVICE = 'ai_service',
    STORAGE = 'storage',
    VALIDATION = 'validation',
    UNKNOWN = 'unknown'
}

// Structured error interface
export interface AppError {
    category: ErrorCategory;
    code: string;
    message: string;
    userMessage: string;
    originalError?: Error;
    retryable: boolean;
    timestamp: Date;
}

// Error codes for specific error types
export const ErrorCodes = {
    // Network errors
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_FETCH_FAILED: 'NETWORK_FETCH_FAILED',

    // Location errors
    LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
    LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
    LOCATION_TIMEOUT: 'LOCATION_TIMEOUT',

    // Auth errors
    AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    AUTH_NOT_AUTHENTICATED: 'AUTH_NOT_AUTHENTICATED',
    AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',

    // Subscription errors
    SUBSCRIPTION_LOAD_FAILED: 'SUBSCRIPTION_LOAD_FAILED',
    SUBSCRIPTION_PURCHASE_FAILED: 'SUBSCRIPTION_PURCHASE_FAILED',
    SUBSCRIPTION_RESTORE_FAILED: 'SUBSCRIPTION_RESTORE_FAILED',

    // AI Service errors
    AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
    AI_SERVICE_RATE_LIMITED: 'AI_SERVICE_RATE_LIMITED',
    AI_SERVICE_PREMIUM_REQUIRED: 'AI_SERVICE_PREMIUM_REQUIRED',

    // Storage errors
    STORAGE_READ_FAILED: 'STORAGE_READ_FAILED',
    STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',

    // Validation errors
    VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
    VALIDATION_MISSING_REQUIRED: 'VALIDATION_MISSING_REQUIRED',

    // Unknown
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Classify an unknown error into a structured AppError
 */
export function classifyError(error: unknown): AppError {
    const timestamp = new Date();

    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Network errors
        if (
            message.includes('network') ||
            message.includes('fetch') ||
            message.includes('connection') ||
            message.includes('timeout') ||
            message.includes('econnrefused') ||
            message.includes('no internet')
        ) {
            return {
                category: ErrorCategory.NETWORK,
                code: message.includes('timeout') ? ErrorCodes.NETWORK_TIMEOUT : ErrorCodes.NETWORK_FETCH_FAILED,
                message: error.message,
                userMessage: 'Unable to connect. Please check your internet connection and try again.',
                originalError: error,
                retryable: true,
                timestamp,
            };
        }

        // Location errors
        if (
            message.includes('location') ||
            message.includes('permission') ||
            message.includes('gps') ||
            message.includes('geolocation')
        ) {
            return {
                category: ErrorCategory.LOCATION,
                code: message.includes('permission') ? ErrorCodes.LOCATION_PERMISSION_DENIED : ErrorCodes.LOCATION_UNAVAILABLE,
                message: error.message,
                userMessage: 'Location access is required for accurate prayer times. Please enable location services.',
                originalError: error,
                retryable: message.includes('timeout'),
                timestamp,
            };
        }

        // Auth errors
        if (
            message.includes('auth') ||
            message.includes('token') ||
            message.includes('session') ||
            message.includes('unauthorized') ||
            message.includes('401')
        ) {
            return {
                category: ErrorCategory.AUTHENTICATION,
                code: message.includes('expired') ? ErrorCodes.AUTH_SESSION_EXPIRED : ErrorCodes.AUTH_NOT_AUTHENTICATED,
                message: error.message,
                userMessage: 'Please sign in to access this feature.',
                originalError: error,
                retryable: false,
                timestamp,
            };
        }

        // Subscription/Purchase errors
        if (
            message.includes('purchase') ||
            message.includes('subscription') ||
            message.includes('billing')
        ) {
            return {
                category: ErrorCategory.SUBSCRIPTION,
                code: message.includes('purchase') ? ErrorCodes.SUBSCRIPTION_PURCHASE_FAILED : ErrorCodes.SUBSCRIPTION_LOAD_FAILED,
                message: error.message,
                userMessage: 'Unable to process subscription. Please try again or contact support.',
                originalError: error,
                retryable: true,
                timestamp,
            };
        }

        // AI Service errors
        if (
            message.includes('ai') ||
            message.includes('gemini') ||
            message.includes('openai') ||
            message.includes('rate limit') ||
            message.includes('429')
        ) {
            const isRateLimited = message.includes('rate') || message.includes('429');
            return {
                category: ErrorCategory.AI_SERVICE,
                code: isRateLimited ? ErrorCodes.AI_SERVICE_RATE_LIMITED : ErrorCodes.AI_SERVICE_UNAVAILABLE,
                message: error.message,
                userMessage: isRateLimited
                    ? 'Too many requests. Please wait a moment and try again.'
                    : 'AI service is temporarily unavailable. Please try again later.',
                originalError: error,
                retryable: true,
                timestamp,
            };
        }

        // Storage errors
        if (
            message.includes('storage') ||
            message.includes('asyncstorage') ||
            message.includes('cache')
        ) {
            return {
                category: ErrorCategory.STORAGE,
                code: message.includes('read') ? ErrorCodes.STORAGE_READ_FAILED : ErrorCodes.STORAGE_WRITE_FAILED,
                message: error.message,
                userMessage: 'Unable to save your data. Please check your device storage.',
                originalError: error,
                retryable: true,
                timestamp,
            };
        }
    }

    // Unknown error
    return createUnknownError(error);
}

/**
 * Create an unknown error wrapper
 */
function createUnknownError(error: unknown): AppError {
    const message = error instanceof Error
        ? error.message
        : typeof error === 'string'
            ? error
            : 'An unexpected error occurred';

    return {
        category: ErrorCategory.UNKNOWN,
        code: ErrorCodes.UNKNOWN_ERROR,
        message,
        userMessage: 'Something went wrong. Please try again.',
        originalError: error instanceof Error ? error : undefined,
        retryable: true,
        timestamp: new Date(),
    };
}

/**
 * Log an error with context
 */
export function logError(context: string, error: AppError): void {
    const logPrefix = getLogPrefix(error.category);
    console.error(
        `${logPrefix} [${context}] ${error.code}: ${error.message}`,
        {
            category: error.category,
            code: error.code,
            retryable: error.retryable,
            timestamp: error.timestamp.toISOString(),
        }
    );
}

function getLogPrefix(category: ErrorCategory): string {
    switch (category) {
        case ErrorCategory.NETWORK: return '🌐';
        case ErrorCategory.LOCATION: return '📍';
        case ErrorCategory.AUTHENTICATION: return '🔐';
        case ErrorCategory.SUBSCRIPTION: return '💳';
        case ErrorCategory.AI_SERVICE: return '🤖';
        case ErrorCategory.STORAGE: return '💾';
        case ErrorCategory.VALIDATION: return '⚠️';
        default: return '❌';
    }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @param context - Context string for logging (optional)
 * @returns Promise resolving to the function result
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context?: string
): Promise<T> {
    let lastError: AppError | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = classifyError(error);

            // Log the error
            if (context) {
                logError(`${context} (attempt ${attempt + 1}/${maxRetries})`, lastError);
            }

            // Don't retry if error is not retryable
            if (!lastError.retryable) {
                throw lastError;
            }

            // Don't wait on the last attempt
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    // All retries exhausted
    throw lastError || createUnknownError(new Error('All retries exhausted'));
}

/**
 * Safe execute - catches errors and returns null instead of throwing
 * Useful for optional operations that shouldn't block the main flow
 */
export async function safeExecute<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: string
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        const classified = classifyError(error);
        if (context) {
            logError(context, classified);
        }
        return fallback;
    }
}

/**
 * Create a user-facing error message based on error type
 */
export function getUserFriendlyMessage(error: AppError): string {
    return error.userMessage;
}

/**
 * Check if an error is of a specific category
 */
export function isErrorCategory(error: AppError, category: ErrorCategory): boolean {
    return error.category === category;
}

/**
 * Check if an error requires user authentication
 */
export function requiresAuthentication(error: AppError): boolean {
    return error.category === ErrorCategory.AUTHENTICATION;
}

/**
 * Check if an error is due to network issues
 */
export function isNetworkError(error: AppError): boolean {
    return error.category === ErrorCategory.NETWORK;
}
