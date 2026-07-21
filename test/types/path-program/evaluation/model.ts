export interface Model {
    readonly optional?: {
        readonly keep: boolean;
        readonly rows: Array<{ readonly label: string }>;
        readonly value?: string;
    };
    removable?: string;
    readonly stable: { readonly value: number };
}
