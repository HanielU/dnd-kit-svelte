import type {ClientRect} from '$core/types/rect.js';
import {isHTMLElement} from '$lib/utilities/src/type-guards/ishtmlelement.js';
import {useResizeObserver} from './index.js';
import {getMeasurableNode} from '$core/utilities/nodes/get-measurable-node.js';
import {useNodeRef} from '$utilities';

interface Arguments {
	measureFn: () => (element: HTMLElement) => ClientRect;
}

export function useDragOverlayMeasuring({measureFn}: Arguments) {
	const measure = $derived.by(measureFn);
	let rect = $state<ClientRect | null>(null);
	const handleResize = (entries: ResizeObserverEntry[]) => {
		for (const {target} of entries) {
			if (isHTMLElement(target)) {
				const newRect = measure(target);
				rect = rect ? {...rect, width: newRect.width, height: newRect.height} : newRect;

				break;
			}
		}
	};
	const resizeObserver = useResizeObserver(() => ({callback: handleResize}));
	const handleNodeChange = (element: any) => {
		const node = getMeasurableNode(element);

		resizeObserver?.current?.disconnect();

		if (node) {
			resizeObserver?.current?.observe(node);
		}

		rect = node ? measure(node) : null;
	};

	const [nodeRef, setRef] = useNodeRef(handleNodeChange);

	return {
		get nodeRef() {
			return nodeRef.current;
		},
		get rect() {
			return rect;
		},
		setRef,
	};
}
