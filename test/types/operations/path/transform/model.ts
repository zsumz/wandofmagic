export interface Model {
    readonly profile?: {
        readonly name?: string;
        readonly rows: Array<{ readonly score?: number }>;
    };
    readonly stable: boolean;
}
