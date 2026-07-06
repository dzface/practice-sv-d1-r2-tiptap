# Google·GitHub 로그인 전용 인증 설계

## 목표

회원 인증을 Google과 GitHub OAuth 로그인으로만 제공한다. 이메일·비밀번호 가입, 이메일 인증번호, Apps Script 메일 발송 기능은 모두 제거한다.

## 인증 흐름

- Better Auth의 Google과 GitHub 소셜 공급자를 사용한다.
- 로그인 화면에는 `Google로 로그인`, `GitHub로 로그인` 버튼만 표시한다.
- 공급자가 확인한 이메일과 공급자 계정 ID로 사용자를 식별한다.
- 최초 로그인 뒤 사이트에서 사용할 닉네임을 설정한다.
- 동일 이메일 계정 연결은 Better Auth가 제공하는 안전한 공급자 연결 흐름만 사용한다.
- 기존 로그아웃 기능과 로그인 상태별 헤더 표시는 유지한다.

## 제거 범위

- Better Auth의 `emailAndPassword`와 Email OTP 플러그인을 제거한다.
- 이메일 회원가입·로그인 서버 액션과 입력 화면을 제거한다.
- `/signup`과 `/verify-email` 라우트 파일을 삭제하며, 해당 주소는 별도 리디렉션 없이 404를 반환한다.
- Apps Script 발송 코드와 관련 문서를 삭제한다.
- OTP 이메일 정책, HMAC 서명, 발송 제한 코드와 테스트를 삭제한다.
- `APPS_SCRIPT_EMAIL_URL`, `APPS_SCRIPT_EMAIL_SECRET` 환경변수를 제거한다.
- 이미 만들어진 이메일 계정은 자동 삭제하지 않지만 이메일·비밀번호로 로그인할 수 없게 한다.

## 환경변수

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ORIGIN`
- `BETTER_AUTH_SECRET`

공급자 비밀값은 Cloudflare Secret으로 저장하고 저장소나 클라이언트 코드에 포함하지 않는다.

## 데이터 정리

- 사용하지 않는 `otp_rate_limits` 테이블은 후속 D1 마이그레이션으로 제거한다.
- 이미 적용된 마이그레이션 기록은 수정하지 않고 새 정리 마이그레이션을 추가한다.
- Better Auth의 `user`, `account`, `session`, `verification` 테이블은 소셜 로그인에도 필요하므로 유지한다.

## 오류 처리와 검증

- 설정되지 않은 공급자는 버튼 대신 설정 전 안내를 표시한다.
- OAuth 시작 실패나 콜백 실패는 계정 내부 정보를 노출하지 않는 한국어 메시지로 처리한다.
- Google과 GitHub 각각의 OAuth 시작 URL과 콜백 경로를 확인한다.
- `/signup`, `/verify-email`이 404를 반환하는지 확인한다.
- 이메일·비밀번호 인증 API와 Apps Script 관련 참조가 남지 않았는지 검사한다.
- 테스트, 린트, 타입 검사와 Cloudflare 프로덕션 빌드를 실행한다.
