import type {Active, Over, DraggableNode, DraggableNodes, DroppableContainers, RectMap} from '../store/index.js';
import type {Coordinates, SyntheticEventName, Translate, UniqueIdentifier, ClientRect} from '../types/index.js';
import type {Collision} from '../utilities/algorithms/index.js';
import type {PointerActivationConstraint} from './pointer/index.js';

export enum Response {
	Start = 'start',
	Move = 'move',
	End = 'end',
}

export type SensorContext = {
	activatorEvent: Event | null;
	active: Active | null;
	activeNode: HTMLElement | null;
	collisionRect: ClientRect | null;
	collisions: Collision[] | null;
	draggableNodes: DraggableNodes;
	draggingNode: HTMLElement | null;
	draggingNodeRect: ClientRect | null;
	droppableRects: RectMap;
	droppableContainers: DroppableContainers;
	over: Over | null;
	scrollableAncestors: Element[];
	scrollAdjustedTranslate: Translate | null;
};

export type SensorOptions = {};

export interface SensorProps<T> {
	active: UniqueIdentifier;
	activeNode: DraggableNode;
	event: Event;
	context: SensorContext;
	options: T;
	onAbort(id: UniqueIdentifier): void;
	onPending(
		id: UniqueIdentifier,
		constraint: PointerActivationConstraint,
		initialCoordinates: Coordinates,
		offset?: Coordinates | undefined
	): void;
	onStart(coordinates: Coordinates): void;
	onCancel(): void;
	onMove(coordinates: Coordinates): void;
	onEnd(): void;
}

export type SensorInstance = {
	autoScrollEnabled: boolean;
};

export type SensorActivatorFunction<T> = (
	event: any,
	options: T,
	context: {
		active: DraggableNode;
	}
) => boolean | undefined;

export type Activator<T> = {
	eventName: SyntheticEventName;
	handler: SensorActivatorFunction<T>;
};

export type Activators<T> = Activator<T>[];

type Teardown = () => void;

export interface Sensor<T extends object> {
	new (props: SensorProps<T>): SensorInstance;
	activators: Activators<T>;
	setup?(): Teardown | undefined;
}

export type Sensors = Sensor<any>[];

export type SensorDescriptor<T extends object> = {
	sensor: Sensor<T>;
	options: T;
};

export type SensorHandler = (event: Event, active: UniqueIdentifier) => boolean | void;
