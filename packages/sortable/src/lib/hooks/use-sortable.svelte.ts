import {useDraggable, useDroppable, type UseDraggableArguments, type UseDroppableArguments} from '@dnd-kit-svelte/core';
import type {Data} from '@dnd-kit-svelte/core';
import {
	CSS,
	isKeyboardEvent,
	unwrapResolvableObject,
	useCombinedRefs,
	type ResolvableObject,
	type UnwrapResolvable,
} from '@dnd-kit-svelte/utilities';
import {box} from 'svelte-toolbelt';

import {getSortableContext} from '../components/index.js';
import type {Disabled, SortableData, SortingStrategy} from '../types/index.js';
import {isValidIndex} from '../utilities/index.js';
import {
	defaultAnimateLayoutChanges,
	defaultAttributes,
	defaultNewIndexGetter,
	defaultTransition,
	disabledTransition,
	transitionProperty,
} from './defaults.js';
import type {AnimateLayoutChanges, NewIndexGetter, SortableTransition} from './types.js';
import {useDerivedTransform} from './utilities/index.js';

export type Arguments = Omit<UseDraggableArguments, 'disabled'> &
	Pick<UseDroppableArguments, 'resizeObserverConfig'> &
	ResolvableObject<{
		animateLayoutChanges?: AnimateLayoutChanges;
		disabled?: boolean | Disabled;
		getNewIndex?: NewIndexGetter;
		strategy?: SortingStrategy;
		transition?: SortableTransition | null;
	}>;

export function useSortable(args: Arguments) {
	const {
		animateLayoutChanges = defaultAnimateLayoutChanges,
		attributes: userDefinedAttributes,
		disabled: localDisabled,
		data: customData,
		getNewIndex = defaultNewIndexGetter,
		id,
		strategy: localStrategy,
		resizeObserverConfig,
		transition = defaultTransition,
	} = $derived(unwrapResolvableObject(args));

	const {
		items,
		containerId,
		activeIndex,
		disabled: globalDisabled,
		disableTransforms,
		sortedRects,
		overIndex,
		useDragOverlay,
		strategy: globalStrategy,
	} = $derived(getSortableContext());

	const disabled: Disabled = $derived(normalizeLocalDisabled(localDisabled, globalDisabled));
	const index = $derived(items.indexOf(id));
	const data = $derived<SortableData & Data>({sortable: {containerId, index, items}, ...customData});
	const itemsAfterCurrentSortable = $derived(items.slice(items.indexOf(id)));

	const {
		rect,
		node,
		isOver,
		setNodeRef: setDroppableNodeRef,
	} = useDroppable({
		id: () => id,
		data: () => data,
		disabled: () => disabled.droppable,
		resizeObserverConfig: () => ({
			updateMeasurementsFor: itemsAfterCurrentSortable,
			...resizeObserverConfig,
		}),
	});

	const {
		active,
		activatorEvent,
		activeNodeRect,
		attributes,
		setNodeRef: setDraggableNodeRef,
		listeners,
		isDragging,
		over,
		setActivatorNodeRef,
		transform,
	} = useDraggable({
		id: () => id,
		data: () => data,
		attributes: () => ({
			...defaultAttributes,
			...userDefinedAttributes,
		}),
		disabled: () => disabled.draggable,
	});

	const setNodeRef = $derived(useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef));
	const isSorting = $derived(Boolean(active.current));
	const displaceItem = $derived(
		isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex)
	);
	const shouldDisplaceDragSource = $derived(!useDragOverlay && isDragging.current);
	const dragSourceDisplacement = $derived(shouldDisplaceDragSource && displaceItem ? transform.current : null);
	const strategy = $derived(localStrategy ?? globalStrategy);
	const finalTransform = $derived(
		displaceItem
			? (dragSourceDisplacement ??
					strategy({
						rects: sortedRects,
						activeNodeRect: activeNodeRect.current,
						activeIndex,
						overIndex,
						index,
					}))
			: null
	);
	const newIndex = $derived(
		isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({id, items, activeIndex, overIndex}) : index
	);
	const activeId = $derived(active.current?.id);

	const previous = {
		activeId,
		items,
		newIndex,
		containerId,
	};

	const itemsHaveChanged = $derived(items !== previous.items);
	const shouldAnimateLayoutChanges = $derived(
		animateLayoutChanges({
			active: active.current,
			containerId,
			isDragging: isDragging.current,
			isSorting,
			id,
			index,
			items,
			newIndex: previous.newIndex,
			previousItems: previous.items,
			previousContainerId: previous.containerId,
			transition,
			wasDragging: previous.activeId != null,
		})
	);

	const derivedTransform = useDerivedTransform(() => ({
		disabled: !shouldAnimateLayoutChanges,
		index,
		node: node.current,
		rect: rect.current,
	}));

	$effect(() => {
		if (isSorting && previous.newIndex !== newIndex) {
			previous.newIndex = newIndex;
		}

		if (containerId !== previous.containerId) {
			previous.containerId = containerId;
		}

		if (items !== previous.items) {
			previous.items = items;
		}
	});

	$effect(() => {
		if (activeId === previous.activeId) {
			return;
		}

		if (activeId != null && previous.activeId == null) {
			previous.activeId = activeId;
			return;
		}

		const timeoutId = setTimeout(() => {
			previous.activeId = activeId;
		}, 50);

		return () => clearTimeout(timeoutId);
	});

	return {
		active,
		activeIndex: box.with(() => activeIndex),
		attributes,
		data: box.with(() => data),
		rect,
		index: box.with(() => index),
		newIndex: box.with(() => newIndex),
		items: box.with(() => items),
		isOver,
		isSorting: box.with(() => isSorting),
		isDragging,
		listeners,
		node: box.with(() => node.current, setNodeRef),
		activatorNode: box.with(() => null as unknown as HTMLElement, setActivatorNodeRef),
		// droppableNode: box.with(() => null as unknown as HTMLElement, setDroppableNodeRef),
		// draggableNode: box.with(() => null as unknown as HTMLElement, setDraggableNodeRef),
		overIndex: box.with(() => overIndex),
		over,
		setNodeRef,
		setActivatorNodeRef,
		setDroppableNodeRef,
		setDraggableNodeRef,
		transform: box.with(() => derivedTransform.current ?? finalTransform),
		transition: box.with(getTransition),
	};

	function getTransition() {
		if (
			// Temporarily disable transitions for a single frame to set up derived transforms
			derivedTransform.current ||
			// TODO: this doesn't seem to work (not sure?), items may still jump to back to their "new" position when items change
			// Or to prevent items jumping to back to their "new" position when items change
			(itemsHaveChanged && previous.newIndex === index)
		) {
			return disabledTransition;
		}

		if ((shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent.current)) || !transition) {
			return undefined;
		}

		if (isSorting || shouldAnimateLayoutChanges) {
			return CSS.Transition.toString({
				...transition,
				property: transitionProperty,
			});
		}

		return undefined;
	}
}

function normalizeLocalDisabled(localDisabled: UnwrapResolvable<Arguments['disabled']>, globalDisabled: Disabled) {
	if (typeof localDisabled === 'boolean') {
		return {
			draggable: localDisabled,
			// Backwards compatibility
			droppable: false,
		};
	}

	return {
		draggable: localDisabled?.draggable ?? globalDisabled.draggable,
		droppable: localDisabled?.droppable ?? globalDisabled.droppable,
	};
}
