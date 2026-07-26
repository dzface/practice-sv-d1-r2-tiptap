import { eq } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { pointSettings } from '$lib/server/db/schema';

export const pointSettingId = 'default';

export const pointEventDefaults = [
	{ key: 'signup', label: '회원가입', value: 0 },
	{ key: 'login', label: '로그인', value: 0 },
	{ key: 'post_create', label: '글작성', value: 0 },
	{ key: 'comment_create', label: '댓글작성', value: 0 },
	{ key: 'file_upload', label: '파일업로드', value: 0 },
	{ key: 'file_download', label: '파일 다운로드(이미지제외)', value: 0 },
	{ key: 'read_other_post', label: '다른사람글을 읽음', value: 0 },
	{ key: 'vote_other_post_up', label: '다른사람 글을 추천함', value: 0 },
	{ key: 'vote_other_post_down', label: '다른사람 글을 비추천함', value: 0 },
	{ key: 'vote_other_comment_up', label: '다른사람의 댓글 추천', value: 0 },
	{ key: 'vote_other_comment_down', label: '다른사람 댓글 비추천', value: 0 },
	{ key: 'my_file_downloaded', label: '내파일 다운로드됨(이미지 제외)', value: 0 },
	{ key: 'my_post_upvoted', label: '내글이 추천받음', value: 0 },
	{ key: 'my_post_downvoted', label: '내글이 비추천받음', value: 0 },
	{ key: 'my_comment_upvoted', label: '내 댓글이 추천받음', value: 0 },
	{ key: 'my_comment_downvoted', label: '내 댓글이 비추천받음', value: 0 },
	{ key: 'lil_to_big', label: '빅토끼 이동', value: 100 },
	{ key: 'lil_to_worst', label: '워스트 이동', value: -30 },
	{ key: 'big_to_trend', label: '빅토끼 인기글 이동', value: 1000 }
] as const;

type Db = ReturnType<typeof getDb>;

type PointEventKey = (typeof pointEventDefaults)[number]['key'];
export type PointEventValueMap = Record<PointEventKey, number>;

export type PointSettings = {
	pointName: string;
	maxLevel: number;
	blockDownloadForUsers: boolean;
	blockReadForUsers: boolean;
	eventValues: PointEventValueMap;
};

export const defaultPointEventValues = Object.fromEntries(
	pointEventDefaults.map((event) => [event.key, event.value])
) as PointEventValueMap;

export const defaultPointSettings: PointSettings = {
	pointName: '포인트',
	maxLevel: 5,
	blockDownloadForUsers: false,
	blockReadForUsers: false,
	eventValues: defaultPointEventValues
};

function normalizeEventValues(values: unknown): PointEventValueMap {
	const input = values && typeof values === 'object' ? (values as Record<string, unknown>) : {};
	return Object.fromEntries(
		pointEventDefaults.map((event) => {
			const value = Number(input[event.key]);
			return [event.key, Number.isFinite(value) ? value : event.value];
		})
	) as PointEventValueMap;
}

function normalizeSettings(row: typeof pointSettings.$inferSelect | null): PointSettings {
	if (!row) return defaultPointSettings;
	return {
		pointName: row.pointName,
		maxLevel: row.maxLevel,
		blockDownloadForUsers: row.blockDownloadForUsers,
		blockReadForUsers: row.blockReadForUsers,
		eventValues: normalizeEventValues(row.eventValues)
	};
}

export function parsePointSettingsForm(form: FormData): PointSettings {
	const pointName = String(form.get('pointName') ?? '').trim() || defaultPointSettings.pointName;
	const maxLevel = Math.max(1, Number(form.get('maxLevel')) || defaultPointSettings.maxLevel);
	const eventValues = Object.fromEntries(
		pointEventDefaults.map((event) => {
			const value = Number(form.get(event.key));
			return [event.key, Number.isFinite(value) ? value : event.value];
		})
	) as PointEventValueMap;

	return {
		pointName: pointName.slice(0, 20),
		maxLevel,
		blockDownloadForUsers: form.has('blockDownloadForUsers'),
		blockReadForUsers: form.has('blockReadForUsers'),
		eventValues
	};
}

export function createPointSettingsRepository(db: Db) {
	return {
		find: async () => {
			const [row] = await db
				.select()
				.from(pointSettings)
				.where(eq(pointSettings.id, pointSettingId))
				.limit(1);
			return normalizeSettings(row ?? null);
		},

		save: async (settings: PointSettings) => {
			await db
				.insert(pointSettings)
				.values({
					id: pointSettingId,
					pointName: settings.pointName,
					maxLevel: settings.maxLevel,
					blockDownloadForUsers: settings.blockDownloadForUsers,
					blockReadForUsers: settings.blockReadForUsers,
					eventValues: settings.eventValues,
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: pointSettings.id,
					set: {
						pointName: settings.pointName,
						maxLevel: settings.maxLevel,
						blockDownloadForUsers: settings.blockDownloadForUsers,
						blockReadForUsers: settings.blockReadForUsers,
						eventValues: settings.eventValues,
						updatedAt: new Date()
					}
				});
		}
	};
}
