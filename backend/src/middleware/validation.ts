import { body, query, param } from 'express-validator';

/**
 * Validation for price request (POST - body parameters)
 */
export const validatePriceRequest = [
  body('token')
    .isString()
    .custom((value) => {
      // Allow contract addresses (0x + up to 40 hex chars) or token symbols (2-10 alphanumeric)
      const isContractAddress = /^0x[a-fA-F0-9]{1,40}$/.test(value);
      const isTokenSymbol = /^[A-Za-z0-9]{2,10}$/.test(value);
      
      if (!isContractAddress && !isTokenSymbol) {
        throw new Error('Token must be a valid contract address (0x...) or symbol (2-10 chars)');
      }
      return true;
    })
    .withMessage('Token must be a valid contract address or symbol'),
  
  body('network')
    .isString()
    .isIn(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'])
    .withMessage('Network must be one of: ethereum, polygon, arbitrum, optimism, base'),
  
  body('timestamp')
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date string')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Timestamp cannot be in the future');
      }
      return true;
    })
];

/**
 * Validation for price request (GET - query parameters)
 */
export const validatePriceQueryRequest = [
  query('token')
    .isString()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Token must be a valid alphanumeric string (1-10 characters)'),
  
  query('network')
    .isString()
    .isIn(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'])
    .withMessage('Network must be one of: ethereum, polygon, arbitrum, optimism, base'),
  
  query('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date string')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        if (date > now) {
          throw new Error('Timestamp cannot be in the future');
        }
      }
      return true;
    })
];

/**
 * Validation for schedule request
 */
export const validateScheduleRequest = [
  body('token')
    .isString()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Token must be a valid alphanumeric string (1-10 characters)'),
  
  body('network')
    .isString()
    .isIn(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'])
    .withMessage('Network must be one of: ethereum, polygon, arbitrum, optimism, base'),
  
  body('interval')
    .optional()
    .isString()
    .matches(/^[0-9\s\*\/\-,]+$/)
    .withMessage('Interval must be a valid cron expression'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean value')
];

/**
 * Validation for price history request
 */
export const validatePriceHistoryRequest = [
  query('token')
    .isString()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Token must be a valid alphanumeric string (1-10 characters)'),
  
  query('network')
    .isString()
    .isIn(['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'])
    .withMessage('Network must be one of: ethereum, polygon, arbitrum, optimism, base'),
  
  query('from')
    .isISO8601()
    .withMessage('From timestamp must be a valid ISO 8601 date string'),
  
  query('to')
    .isISO8601()
    .withMessage('To timestamp must be a valid ISO 8601 date string')
    .custom((value, { req }) => {
      const fromDate = new Date(req.query?.from as string);
      const toDate = new Date(value);
      if (toDate <= fromDate) {
        throw new Error('To timestamp must be after from timestamp');
      }
      return true;
    }),
  
  query('interval')
    .optional()
    .isString()
    .isIn(['1m', '5m', '15m', '30m', '1h', '4h', '1d'])
    .withMessage('Interval must be one of: 1m, 5m, 15m, 30m, 1h, 4h, 1d')
];

/**
 * Validation for job ID parameter
 */
export const validateJobId = [
  param('jobId')
    .isUUID()
    .withMessage('Job ID must be a valid UUID')
];

/**
 * Validation for job update request
 */
export const validateJobUpdateRequest = [
  body('enabled')
    .isBoolean()
    .withMessage('Enabled must be a boolean value')
];

const validationMiddleware = {
  validatePriceRequest,
  validateScheduleRequest,
  validatePriceHistoryRequest,
  validateJobId,
  validateJobUpdateRequest
};

export default validationMiddleware;
