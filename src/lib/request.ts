import axios, { AxiosError } from 'axios';
import { RequestFunction } from '../types';

export function createRequestInstance(authHeader?: string) {
    const headers: Record<string, string> = {};

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const instance = axios.create({ headers });

    const httpGetFn: RequestFunction = async url => {
        try {
            const { data } = await instance.get(url);
            return { data, error: null };
        } catch (error) {
            if (error instanceof AxiosError) {
                return {
                    data: null,
                    error: {
                        status: error.status ?? null,
                        message: error.message
                    }
                };
            } else {
                return {
                    data: null,
                    error: { status: null, message: error }
                };
            }
        }
    };

    return { httpGetFn };
}
