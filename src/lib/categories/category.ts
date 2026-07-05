export type CategorySummary = {
	id: string;
	slug: string;
	name: string;
	group: string;
	groupOrder: number;
	sortOrder: number;
};

export type CategoryGroup = {
	name: string;
	categories: CategorySummary[];
};

export function groupCategories(categories: CategorySummary[]): CategoryGroup[] {
	const groups = new Map<string, { order: number; entries: CategorySummary[] }>();

	for (const category of categories) {
		const group = groups.get(category.group) ?? { order: category.groupOrder, entries: [] };
		group.entries.push(category);
		groups.set(category.group, group);
	}

	return [...groups]
		.sort(([, first], [, second]) => first.order - second.order)
		.map(([name, group]) => ({
			name,
			categories: [...group.entries].sort((first, second) => first.sortOrder - second.sortOrder)
		}));
}
