import type {KeyboardCoordinateGetter, KeyboardCodes} from './types.js';
import {KeyboardCode} from './types.js';

export const defaultKeyboardCodes: KeyboardCodes = {
	start: [KeyboardCode.Space, KeyboardCode.Enter],
	cancel: [KeyboardCode.Esc],
	end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab],
};

export const defaultKeyboardCoordinateGetter: KeyboardCoordinateGetter = (event, {currentCoordinates}) => {
	switch (event.code) {
		case KeyboardCode.Right:
			return {
				...currentCoordinates,
				x: currentCoordinates.x + 25,
			};
		case KeyboardCode.Left:
			return {
				...currentCoordinates,
				x: currentCoordinates.x - 25,
			};
		case KeyboardCode.Down:
			return {
				...currentCoordinates,
				y: currentCoordinates.y + 25,
			};
		case KeyboardCode.Up:
			return {
				...currentCoordinates,
				y: currentCoordinates.y - 25,
			};
	}

	return undefined;
};
