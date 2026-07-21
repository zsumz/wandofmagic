export interface Model {
    readonly profile?: {
        readonly keep: boolean;
        readonly nested: { readonly keep: boolean; readonly token: string };
        readonly rows: Array<{ readonly keep: boolean; readonly label: string }>;
        readonly secret: string;
    };
    readonly stable: boolean;
    readonly topSecret: string;
}
