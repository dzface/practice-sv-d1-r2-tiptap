import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) return fail(400, { message: '이메일과 비밀번호를 입력해 주세요.' });

		try {
			await locals.auth.api.signInEmail({ body: { email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: '이메일 또는 비밀번호를 확인해 주세요.' });
			}
			return fail(500, { message: '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
		}

		redirect(303, '/');
	}
};
