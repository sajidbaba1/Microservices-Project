import { Request, Response, NextFunction } from 'express';

/**
 * QA Mindset: Global Error Handler
 * Ensures that the system doesn't leak technical details (like stack traces)
 * while providing consistent error responses.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error]: ${err.message}`);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        error: message,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
