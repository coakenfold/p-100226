export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly GUEST: "guest";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
//# sourceMappingURL=index.d.ts.map