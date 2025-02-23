import {arrayMove} from '../utilities/index.js';
import type {SortingStrategy} from '../types/index.js';

export const rectSortingStrategy: SortingStrategy = ({rects, activeIndex, overIndex, index}) => {
	const newRects = arrayMove(rects, overIndex, activeIndex);

	const oldRect = rects[index];
	const newRect = newRects[index];

	if (!newRect || !oldRect) {
		return null;
	}

	return {
		x: newRect.left - oldRect.left,
		y: newRect.top - oldRect.top,
		scaleX: newRect.width / oldRect.width,
		scaleY: newRect.height / oldRect.height,
	};
};
