import {GTR, CD,AP1, EU1,US1,US2,US3} from './config'


export const INDEXES = {
	USERS: 'users',
	MEETINGS:'meetings',
	SYSTEM_EVENTS:'system-events',
	MESSAGES: 'messages'
}

export const INDEXES_VALUES = Object.values(INDEXES);

export const CLUSTERS = {
	GTR: {
		url: GTR,
		name:'gtr'
	},
	EU1: {
		url: EU1,
		name:'eu1'
	},
	CD: {
		url: CD,
		name:'cd'
	},
	AP1: {
		url: AP1,
		name:'ap1'
	},
	US1: {
		url:  US1,
		name:'us1'
	},
	US2: {
		url: US2,
		name:'us2'
	},
	US3: {
		url: US3,
		name:'us3'
	},
};

export const CLUSTERS_VALUES = Object.values(CLUSTERS);
