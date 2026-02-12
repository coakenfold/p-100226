import type { User } from './models.js';
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: Omit<User, 'updatedAt'>;
}
export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
}
export interface ApiErrorResponse {
    error: string;
    message: string;
    statusCode: number;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=api.d.ts.map