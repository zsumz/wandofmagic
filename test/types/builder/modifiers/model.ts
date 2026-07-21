export interface Input {
    readonly id: string;
    nickname?: string;
    retries?: string;
    state?: 'active' | 'inactive' | undefined;
}
