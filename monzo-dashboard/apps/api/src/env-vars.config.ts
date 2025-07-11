import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // Database
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    // Monzo OAuth
    MONZO_CLIENT_ID: Joi.string().required(),
    MONZO_CLIENT_SECRET: Joi.string().required(),
    MONZO_REDIRECT_URI: Joi.string().uri().required(),

    VITE_FRONTEND_URL: Joi.string().uri().required(),
    VITE_API_URL: Joi.string().uri().required(),

    // Encryption
    ENCRYPTION_ALGORITHM: Joi.string().valid('aes-256-cbc').required(),
    ENCRYPTION_KEY: Joi.string().length(64).required(),
    ENCRYPTION_IV: Joi.string().length(32).required(),
});