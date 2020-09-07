export interface IRequiredEntityAttrs {
    id: string;
    grantId?: string;
    userCode?: string;
    uid?: string;
    data: any;
    expiresAt: Date;
    consumedAt: Date;
}