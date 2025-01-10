import type {Without} from '$utilities';
import type {DOMAttributes} from 'svelte/elements';

export type SyntheticEventName = keyof Without<DOMAttributes<any>, 'children'>;
