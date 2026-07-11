import { eq } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { profiles, user } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;

const profileSummary = {
	userId: profiles.userId,
	nickname: profiles.nickname,
	role: profiles.role,
	status: profiles.status,
	points: profiles.points,
	createdAt: profiles.createdAt,
	updatedAt: profiles.updatedAt
};

export type ProfileSummary = typeof profiles.$inferSelect;

export function createProfileRepository(db: Db) {
	return {
		findByUserId: async (userId: string) => {
			const [profile] = await db
				.select(profileSummary)
				.from(profiles)
				.where(eq(profiles.userId, userId))
				.limit(1);
			return profile ?? null;
		},

		isNicknameTaken: async (nickname: string) => {
			const [profile] = await db
				.select({ userId: profiles.userId })
				.from(profiles)
				.where(eq(profiles.nickname, nickname))
				.limit(1);
			return Boolean(profile);
		},

		updateNickname: async ({ userId, nickname }: { userId: string; nickname: string }) => {
			await db.update(profiles).set({ nickname }).where(eq(profiles.userId, userId));
		},

		deleteAccount: async (userId: string) => {
			await db.delete(user).where(eq(user.id, userId));
		},

		create: async ({ userId, nickname }: { userId: string; nickname: string }) => {
			await db.insert(profiles).values({ userId, nickname });
			return await db.query.profiles.findFirst({
				where: eq(profiles.userId, userId),
				columns: {
					userId: true,
					nickname: true,
					role: true,
					status: true,
					points: true,
					createdAt: true,
					updatedAt: true
				}
			});
		}
	};
}
