export interface Model {
    readonly profile?: {
        readonly name: string;
        readonly rows: Array<{ readonly label: string }>;
    };
    readonly stable: boolean;
}
