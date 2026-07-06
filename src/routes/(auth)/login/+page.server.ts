import { env } from '$env/dynamic/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
	return {
		googleEnabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
		githubEnabled: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
	};
};

async function startSocialLogin(
	provider: 'google' | 'github',
	locals: App.Locals,
	request: Request
) {
	let result: Awaited<ReturnType<typeof locals.auth.api.signInSocial>>;

	try {
		result = await locals.auth.api.signInSocial({
			body: { provider, callbackURL: '/', errorCallbackURL: '/login' },
			headers: request.headers
		});
	} catch (error) {
		console.error('Failed to start social login', { provider, error });
		return fail(500, { message: '소셜 로그인을 시작하지 못했습니다.' });
	}

	if (result.url) redirect(303, result.url);

	return fail(500, { message: '소셜 로그인 설정을 확인해 주세요.' });
}

export const actions: Actions = {
	google: ({ locals, request }) => startSocialLogin('google', locals, request),
	github: ({ locals, request }) => startSocialLogin('github', locals, request)
};
