export interface PathExample {
    readonly createdAt: Date;
    readonly profile?: {
        readonly age?: string;
        readonly name: string;
    };
    readonly rows: Array<{
        readonly count: string;
        readonly label: string;
    }>;
}

export type PathVariant =
    | { common?: { side: 'left'; value?: string } }
    | { common: { side: 'right'; value: string } };

export interface DeepPathExample {
    a: { b: { c: { d: { e: { f: { g: { h: { i: string } } } } } } } };
}
