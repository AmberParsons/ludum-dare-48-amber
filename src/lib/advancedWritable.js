import { writable } from 'svelte/store';

function parseValue(value) {
	try {
		return JSON.parse(value);
	} catch (error) {
		console.log('Error parsing stored value:');
		console.log(value);
		console.error(error);
		return null;
	}
}

export const advancedWritable = (defaultValue, storage) => {
	const { type, name } = storage || {};
	let initialValue;
	if (typeof window === 'undefined') {
		initialValue = defaultValue;
	} else if (storage) {
		let v;
		if (type === 'local') {
			v = window.localStorage.getItem(name);
		}
		if (type === 'session') {
			v = window.sessionStorage.getItem(name);
		}
		if (!v) initialValue = defaultValue;
		else initialValue = parseValue(v) || defaultValue;
	} else {
		initialValue = defaultValue;
	}

	const { subscribe, set, update } = writable(initialValue);

	function setFunc(value) {
		set(value);
		if (storage) {
			if (type === 'local') {
				window.localStorage.setItem(name, JSON.stringify(value));
			}
			if (type === 'session') {
				window.sessionStorage.setItem(name, JSON.stringify(value));
			}
		}
	}

	function getFunc() {
		let _value;
		update((n) => {
			_value = n;
			return n;
		});
		return _value;
	}

	if (type && name && typeof window !== 'undefined') {
		window.addEventListener('storage', (event) => {
			if (event.storageArea !== localStorage) return;
			const { key, newValue } = event;
			if (key === name) {
				set(parseValue(newValue));
			}
		});
	}

	return {
		subscribe,
		update,
		set: setFunc,
		setValue: (key, value) => {
			const n = getFunc();
			n[key] = value;
			setFunc(n);
		},
		deleteValue: (key) => {
			const n = getFunc();
			delete n[key];
			setFunc(n);
		},
		get: getFunc,
		reset: () => set(initialValue)
	};
};
