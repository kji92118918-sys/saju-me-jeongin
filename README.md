# 사주미

이름과 생시를 입력하면 Gemini가 사주를 해석해 주는 웹 서비스입니다.  
친구에게 말하듯 친근한 반말로, 성격·기질·재능을 풀어 줍니다.

## 기능

- 이름, 생년월일, 태어난 시간, 성별, 양력/음력 입력
- Gemini (`gemini-3.6-flash`)로 사주 기본차트 해석
- 해석 결과는 별도 결과 페이지(`/result`)에서 확인
- 모노톤·중앙 정렬의 몽환적인 UI

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 Gemini API 키를 넣습니다.

```bash
cp .env.example .env
```

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

API 키는 [Google AI Studio](https://aistudio.google.com/)에서 발급받을 수 있습니다.  
`.env`는 Git에 올라가지 않습니다. 키가 필요할 때는 `.env.example`을 참고하세요.

### 3. 개발 서버 실행

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

- React + Vite
- React Router
- Google Gemini API (`@google/genai`)

## 참고

현재 명식(년주·월주·일주·시주 등)은 입력값에서 자동 계산하지 않고, 기본 차트 컨텍스트를 바탕으로 해석합니다.
