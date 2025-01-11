import {getInternalContext, type Data} from '$core/store/index.js';
import type {UniqueIdentifier} from '$core/types/index.js';
import {useNodeRef, useUniqueId, type Transform} from '$utilities';
import {watch} from 'runed';
import {useSyntheticListeners, type SyntheticListenerMap} from './utilities/index.js';
import {box} from 'svelte-toolbelt';
import {getActiveDraggableContext} from '$core/components/dnd-context/dnd-context.svelte';

export interface UseDraggableArguments {
	id: UniqueIdentifier;
	data?: Data;
	disabled?: boolean;
	attributes?: {
		role?: string;
		roleDescription?: string;
		tabIndex?: number;
	};
}

export interface DraggableAttributes {
	role: string;
	tabIndex: number;
	'aria-disabled': boolean;
	'aria-pressed': boolean | undefined;
	'aria-roledescription': string;
	'aria-describedby': string;
}

export type DraggableSyntheticListeners = SyntheticListenerMap | undefined;

// const NullContext = createContext<any>(null);

const defaultRole = 'button';

const ID_PREFIX = 'Draggable';

export function useDraggable(argsFn: () => UseDraggableArguments) {
	const key = useUniqueId(ID_PREFIX);
	const {id, disabled = false, data, attributes} = $derived.by(argsFn);
	const {activators, activatorEvent, active, activeNodeRect, ariaDescribedById, draggableNodes, over} =
		$derived.by(getInternalContext);
	const {role = defaultRole, roleDescription = 'draggable', tabIndex = 0} = $derived(attributes ?? {});
	const isDragging = $derived(active?.id === id);
	const transform: Transform | null = $derived(isDragging ? getActiveDraggableContext() : null);

	const [node, setNodeRef] = useNodeRef();
	const [activatorNode, setActivatorNodeRef] = useNodeRef();
	const listeners = useSyntheticListeners(() => [activators, id]);

	watch(
		() => [draggableNodes, id],
		() => {
			draggableNodes.set(id, {id, key, node: node.current, activatorNode: activatorNode.current, data});

			return () => {
				const node = draggableNodes.get(id);

				if (node && node.key === key) {
					draggableNodes.delete(id);
				}
			};
		}
	);

	const memoizedAttributes: DraggableAttributes = $derived({
		role,
		tabIndex,
		'aria-disabled': disabled,
		'aria-pressed': isDragging && role === defaultRole ? true : undefined,
		'aria-roledescription': roleDescription,
		'aria-describedby': ariaDescribedById.draggable,
	});

	return {
		active: box.with(() => active),
		activatorEvent: box.with(() => activatorEvent),
		activeNodeRect: box.with(() => activeNodeRect),
		attributes: box.with(() => memoizedAttributes),
		isDragging: box.with(() => isDragging),
		listeners: box.with(() => (disabled ? undefined : listeners.current)),
		node,
		over: box.with(() => over),
		setNodeRef,
		setActivatorNodeRef,
		transform: box.with(() => transform),
	};
}
