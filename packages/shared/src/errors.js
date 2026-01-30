"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.ERROR_CODES = void 0;
exports.ERROR_CODES = {
    INVALID_REQUEST: 'Invalid request',
    MISSING_ANON_ID: 'Missing anonId',
    MISSING_CONTEXT_ID: 'contextId is required',
    INVALID_CONTEXT_ID: 'Invalid contextId',
    INVALID_LABELS: 'Invalid input labels',
    INVALID_AI_LABELS: 'Invalid AI labels',
    INVALID_AI_SUMMARY: 'Invalid summary',
    INVALID_AI_HINTS: 'Invalid hints/cta',
    QUESTIONS_AI_PARSE: 'AI parse failed',
    QUESTIONS_AI_FAILED: 'Questions generation failed',
    FRAMING_AI_FAILED: 'Framing generation failed',
    ANALYSIS_AI_FAILED: 'Analysis generation failed',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
};
exports.ErrorCode = Object.freeze(Object.keys(exports.ERROR_CODES).reduce((acc, key) => {
    acc[key] = key;
    return acc;
}, {}));
