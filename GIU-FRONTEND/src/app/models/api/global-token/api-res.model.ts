export enum ResType {
    SYSTEM_ERROR = 'ERR',
    ENABLE = '0',
    DISABLE = '1'
};

export interface ResponseDataDesvare {
    code: string,
    response?: any
}
