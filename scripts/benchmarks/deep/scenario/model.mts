export interface DeepBenchmarkInput {
    readonly audit: { readonly traceId: string };
    readonly metadata: { readonly source?: string };
    readonly profile: {
        readonly active: boolean | string;
        readonly age: number | string;
        readonly contact: {
            readonly legacyEmail: string;
        };
        readonly first: string;
        readonly last: string;
        readonly secret: string;
    };
}

export interface DeepBenchmarkOutput {
    readonly metadata: { readonly owner: string };
    readonly profile: {
        readonly active: boolean;
        readonly age: number;
        readonly contact: { readonly email: string };
        readonly first: string;
        readonly last: string;
    };
    readonly summary: { readonly displayName: string };
}

export type DeepBenchmarkMapper = (input: DeepBenchmarkInput) => DeepBenchmarkOutput;
export type DeepBenchmarkCorpus = readonly [DeepBenchmarkInput, ...DeepBenchmarkInput[]];
