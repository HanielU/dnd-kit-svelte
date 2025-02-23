import {isWindow} from '../type-guards/is-window';
import {isNode} from '../type-guards/is-node';

export function getWindow(target: Event['target']): typeof window {
	if (!target) {
		return window;
	}

	if (isWindow(target)) {
		return target;
	}

	if (!isNode(target)) {
		return window;
	}

	return target.ownerDocument?.defaultView ?? window;
}
