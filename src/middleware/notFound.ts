import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../types';

export async function notFound() {
    throw new ApiError('Nie znaleziono podanego zasobu.', HttpStatus.NOT_FOUND);
}
