type NicknameValidationResult =
	| { ok: true; nickname: string }
	| { ok: false; message: string };

const nicknamePattern = /^[가-힣A-Za-z0-9_]+$/;

export function validateNickname(input: FormDataEntryValue | string | null): NicknameValidationResult {
	const nickname = String(input ?? '').trim();

	if (nickname.length < 2 || nickname.length > 16) {
		return { ok: false, message: '닉네임은 2~16자로 입력해 주세요.' };
	}

	if (!nicknamePattern.test(nickname)) {
		return { ok: false, message: '닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.' };
	}

	return { ok: true, nickname };
}
