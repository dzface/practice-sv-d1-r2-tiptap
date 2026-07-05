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
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!name || !email || !password) {
			return fail(400, { message: '이름, 이메일, 비밀번호를 모두 입력해 주세요.' });
		}

		try {
			await locals.auth.api.signUpEmail({ body: { name, email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: '입력 내용을 확인하거나 다른 이메일을 사용해 주세요.' });
			}
			return fail(500, { message: '회원가입 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
		}

		redirect(303, '/');
	}
};
