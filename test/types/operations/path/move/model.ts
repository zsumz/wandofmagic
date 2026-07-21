export interface Model {
    readonly profile: {
        readonly current?: number;
        readonly legacy: string;
        readonly optional?: boolean;
    };
    readonly stable: { readonly value: number };
}
