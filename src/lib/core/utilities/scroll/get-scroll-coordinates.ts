import {isWindow} from '$utilities';

import type {Coordinates} from '../../types/index.js';

export function getScrollXCoordinate(element: Element | typeof window): number {
	if (isWindow(element)) {
		return element.scrollX;
	}

	return element.scrollLeft;
}

export function getScrollYCoordinate(element: Element | typeof window): number {
	if (isWindow(element)) {
		return element.scrollY;
	}

	return element.scrollTop;
}

export function getScrollCoordinates(element: Element | typeof window): Coordinates {
	return {
		x: getScrollXCoordinate(element),
		y: getScrollYCoordinate(element),
	};
}
