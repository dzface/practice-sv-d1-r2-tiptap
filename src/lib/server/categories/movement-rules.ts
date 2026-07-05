export type MovementRuleSeed = {
	id: string;
	sourceCategoryId: string;
	targetCategoryId: string;
	direction: 'gte' | 'lte';
	scoreThreshold: number;
	pointDelta: number;
};

export const initialMovementRules = [
	{
		id: 'lil_to_big',
		sourceCategoryId: 'cat_lil',
		targetCategoryId: 'cat_big',
		direction: 'gte',
		scoreThreshold: 10,
		pointDelta: 100
	},
	{
		id: 'lil_to_worst',
		sourceCategoryId: 'cat_lil',
		targetCategoryId: 'cat_worst',
		direction: 'lte',
		scoreThreshold: -10,
		pointDelta: -30
	},
	{
		id: 'big_to_trend',
		sourceCategoryId: 'cat_big',
		targetCategoryId: 'trend',
		direction: 'gte',
		scoreThreshold: 100,
		pointDelta: 1000
	}
] satisfies MovementRuleSeed[];
