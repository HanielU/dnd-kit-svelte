import type {ClientRect} from '../../types/index.js';
import type {DroppableMeasuring} from '../../hooks/index.js';

export type MeasuringFunction = (node: HTMLElement) => ClientRect;

interface Measuring {
	measure: MeasuringFunction;
}

export interface DraggableMeasuring extends Measuring {}

export interface DragOverlayMeasuring extends Measuring {}

export interface MeasuringConfiguration {
	draggable?: Partial<DraggableMeasuring>;
	droppable?: Partial<DroppableMeasuring>;
	dragOverlay?: Partial<DragOverlayMeasuring>;
}
