/** ISO 8601 date string (e.g. "2024-01-15T09:30:00.000Z") */
export type ISODateString = string;
export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}
//# sourceMappingURL=models.d.ts.map