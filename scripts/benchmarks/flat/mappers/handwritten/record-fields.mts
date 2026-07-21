const objectPrototype = Object.prototype;

export function defineField(record: Record<string, unknown>, key: string, value: unknown): void {
    if (key === '__proto__') {
        Object.defineProperty(record, key, {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
        });
    } else {
        record[key] = value;
    }
}

export function hasOwn(record: object, key: string): boolean {
    return objectPrototype.hasOwnProperty.call(record, key);
}

export function isPlainRecordPrototype(prototype: object | null): boolean {
    return prototype === objectPrototype || prototype === null;
}
