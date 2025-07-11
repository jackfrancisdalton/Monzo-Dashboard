import * as Joi from 'joi';

export const validationSchema = Joi.object({
    // Used to access database for monzo data
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    // Used in Monzo Oauth Flow
    MONZO_CLIENT_ID: Joi.string().required(),
    MONZO_CLIENT_SECRET: Joi.string().required(),
    MONZO_REDIRECT_URI: Joi.string().uri().required(),

    // Used to ecnrypt sensitive data
    ENCRYPTION_ALGORITHM: Joi.string().valid('aes-256-cbc').required(),
    ENCRYPTION_KEY: Joi.string().length(64).required(),
    ENCRYPTION_IV: Joi.string().length(32).required(),

    // Used in Dev mode to allow cors requests from frontend
    VITE_FRONTEND_URL: Joi.string().uri().required(),
});

// TODO: Ensure all env variables ar appropriate for different apps