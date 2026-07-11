export type Pagination = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	pages: number[];
	previousPage: number | null;
	nextPage: number | null;
};

export function createPagination({
	page,
	totalItems,
	pageSize
}: {
	page: number;
	totalItems: number;
	pageSize: number;
}): Pagination {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
	const groupStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
	const groupEnd = Math.min(groupStart + 4, totalPages);
	const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, index) => groupStart + index);

	return {
		page: currentPage,
		pageSize,
		totalItems,
		totalPages,
		pages,
		previousPage: currentPage > 1 ? currentPage - 1 : null,
		nextPage: currentPage < totalPages ? currentPage + 1 : null
	};
}
