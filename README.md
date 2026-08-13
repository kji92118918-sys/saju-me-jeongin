# 사주미

이름과 생시를 입력하면 Gemini가 사주를 해석해 주는 웹 서비스입니다.  
친근한 존댓말로 성격·기질·재능을 풀어 주며, Google 로그인으로 결과를 저장하고 다시 볼 수 있습니다.

## 기능

- 이름, 생년월일, 태어난 시간, 성별, 양력/음력 입력
- Gemini (`gemini-3.6-flash`) 스트리밍 사주 해석
- 게스트 해석: 미리보기 후 Google 로그인으로 전체 결과 잠금 해제
- 로그인 사용자: 프로필(생시) 저장, 해석 결과 DB 저장, 사이드바 히스토리
- 결과 공유·삭제, 로그인 후 대기 중 해석 자동 클레임
- Google Analytics 4 이벤트 추적
- 수묵·붓글씨 톤의 UI

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 생시 입력 및 해석 시작 |
| `/profile` | 프로필 조회·수정 |
| `/result` | 게스트 결과(잠금 미리보기) |
| `/result/:id` | 저장된 결과 |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env`에 아래 값을 채웁니다.

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

| 변수 | 설명 |
|------|------|
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/)에서 발급 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase 프로젝트 Settings → API |
| `VITE_GA_MEASUREMENT_ID` | GA4 Measurement ID (선택) |

`.env`는 Git에 올라가지 않습니다. 키가 필요할 때는 `.env.example`을 참고하세요.

### 3. Supabase 설정

- Auth → Providers에서 **Google** OAuth를 활성화합니다.
- 앱 URL / Redirect URL에 로컬(`http://localhost:5173`)과 배포 도메인을 등록합니다.
- `users`, `saju_readings` 테이블과 RLS, `get_readings_count` RPC가 필요합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 안내된 주소(보통 `http://localhost:5173`)로 접속합니다.  
`.env`를 수정했다면 개발 서버를 재시작하세요.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | Oxlint 검사 |

## 기술 스택

- React 19 + Vite
- React Router
- Supabase Auth / Postgres (`@supabase/supabase-js`)
- Google Gemini API (`@google/genai`)
- Google Analytics 4

## 참고

현재 명식(년주·월주·일주·시주 등)은 입력값에서 자동 계산하지 않고, 기본 차트 컨텍스트를 바탕으로 해석합니다.
