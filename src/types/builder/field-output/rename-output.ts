import type { StringKeyOf } from '../../object/keys.js';
import type {
    LiteralRenameDestinations,
    NoGuaranteedRenameCollisions,
    NoUnknownKeys,
    RenameRecord,
    SafeRenameDestinations,
} from '../../object/rename.js';

export type BuilderRenameMapping<Output extends object> =
    Partial<Record<StringKeyOf<Output>, string>>;

export type BuilderRenameInput<
    Output extends object,
    Mapping extends BuilderRenameMapping<Output>,
> =
    NoUnknownKeys<Mapping, StringKeyOf<Output>>
    & LiteralRenameDestinations<Mapping>
    & SafeRenameDestinations<Mapping>
    & NoGuaranteedRenameCollisions<Output, Mapping>;

export type BuilderRenameOutput<
    Output extends object,
    Mapping extends BuilderRenameMapping<Output>,
> = RenameRecord<Output, Mapping>;
