import { advancedWritable } from '$lib/advancedWritable';

export const settings = advancedWritable(
	{
		theme: 'dark'
	},
	{ type: 'local', name: 'settings' }
);
