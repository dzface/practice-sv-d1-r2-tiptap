export type SiteConfig = Readonly<{
	siteName: string;
	companyName: string;
	reportEmail: string;
	termsEffectiveDate: `${number}-${number}-${number}`;
	description: string;
	siteUrl: string;
}>;

export const siteConfig = {
	siteName: '릴토끼',
	companyName: '릴토끼 운영팀',
	reportEmail: 'dzface031@gmail.com',
	termsEffectiveDate: '2026-07-05',
	description: '작고 단순한 토끼 커뮤니티',
	siteUrl: 'https://practice-sv-d1-r2-tiptap.dzface031.workers.dev/'
} satisfies SiteConfig;
