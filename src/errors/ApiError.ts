import { HttpStatus } from '../types';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status?: HttpStatus | number) {
        super(message);
        this.status = status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        this.name = 'HttpError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
