export interface Model {
    readonly profile?: {
        readonly count?: string;
        readonly name?: 'Ada' | 'Grace' | undefined;
        readonly rows: Array<{ readonly label?: string }>;
    };
    readonly stable: boolean;
}
