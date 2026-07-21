import { baseRuntimeSource } from './base-runtime-source.js';
import { isoDateRuntimeSource } from './iso-date-runtime-source.js';

export function generatedRuntimeSource(includeIsoDate: boolean): readonly string[] {
    return includeIsoDate
        ? [...baseRuntimeSource, ...isoDateRuntimeSource]
        : baseRuntimeSource;
}
