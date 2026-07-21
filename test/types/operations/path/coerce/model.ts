export interface Model {
    readonly profile?: {
        readonly count?: number | string;
        readonly rows: Array<{ readonly value?: string }>;
    };
    readonly stable: boolean;
}
