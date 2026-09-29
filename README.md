# 학교 행사·대회 관리 — Next.js + MongoDB

Figma 화면을 기준으로 만든 학교 행사·대회 관리 웹앱입니다.

## 기술 스택

- Next.js 16.3.5 / App Router
- React 19.2
- MongoDB Node.js Driver 7.6
- JavaScript
- 일반 CSS (Tailwind 사용 안 함)

Next.js App Router는 파일 구조를 URL 라우팅과 서버/클라이언트 컴포넌트에 활용합니다. 이 프로젝트는 별도의 `index.html`이나 `style.css` 파일을 만들어 실행하는 방식이 아니라 Next.js의 `app/` 구조와 `app/globals.css`를 사용합니다.

MongoDB 연결 문자열은 `.env.local`의 `MONGODB_URI`에 넣습니다. MongoDB 공식 Next.js 연동 가이드도 `.env.local`에 연결 URI를 저장하고 재사용 가능한 `MongoClient` 연결을 구성하는 방식을 안내합니다.

## 화면

| 번호 | 화면 | URL |
|---|---|---|
| 01 | 메인 | `/` |
| 02 | 행사 목록 | `/events` |
| 03 | 행사 상세 | `/events/[id]` |
| 04 | 대회 메인 | `/competition` |
| 05 | 경기 일정 | `/schedule` |
| 06 | 경기 결과 | `/results` |
| 07 | 순위표 | `/ranking` |
| 08 | 공지사항 | `/notices` |
| 09 | 로그인 | `/login` |
| 10 | 관리자 대시보드 | `/admin` |
| 11 | 행사 관리 | `/admin/events` |
| 12 | 대회 관리 | `/admin/competitions` |
| 13 | 경기 관리 | `/admin/matches` |
| 14 | 행사 등록 | `/admin/events/new` |
| 15 | 대회 등록 | `/admin/competitions/new` |

12~15번은 기능 구현을 위한 관리자 화면 골격을 포함했습니다. 제공된 Figma 데이터가 없는 부분은 화면 이름과 기존 디자인 시스템에 맞춰 구성했습니다.

## 시작하기

### 1. 요구 사항

Node.js 20.9 이상이 필요합니다.

### 2. 설치

```bash
npm install
```

### 3. MongoDB 설정

프로젝트 루트의 `.env.local` 파일에 연결 정보를 설정합니다.

**로컬 MongoDB 사용 시:**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/school-event-manager
MONGODB_DB=school-event-manager
```

**MongoDB Atlas 사용 시:**
```env
MONGODB_URI=mongodb+srv://아이디:비밀번호@클러스터주소/
MONGODB_DB=school-event-manager
```

연결이 올바른지 확인하려면 다음 명령어를 실행합니다:
```bash
npm run test:db
```

### 4. 테스트 데이터 넣기

```bash
npm run seed
```

`events`, `competitions`, `matches`, `notices` 컬렉션에 기본 데이터를 넣습니다.

MongoDB가 연결되지 않아도 기본 화면이 보이도록 fallback 데이터가 들어가 있어서 UI 확인은 바로 할 수 있습니다.

### 5. 실행

```bash
npm run dev
```

브라우저:

```text
http://localhost:3000
```

## API

### 행사

```text
GET    /api/events
POST   /api/events
DELETE /api/events/:id
```

POST 예시:

```json
{
  "name": "교내 농구대회",
  "date": "2026.09.05",
  "place": "학교 체육관",
  "category": "체육",
  "icon": "🏀",
  "description": "학생들의 체력 증진과 친목을 위해 진행되는 교내 농구대회입니다."
}
```

### 대회

```text
GET  /api/competitions
POST /api/competitions
```

### 경기

```text
GET /api/matches
```

### 공지

```text
GET /api/notices
```

## 프로젝트 구조

```text
school-event-manager-next/
├─ app/
│  ├─ api/
│  ├─ admin/
│  ├─ competition/
│  ├─ events/
│  ├─ login/
│  ├─ notices/
│  ├─ ranking/
│  ├─ results/
│  ├─ schedule/
│  ├─ globals.css
│  ├─ layout.js
│  └─ page.js
├─ components/
├─ lib/
│  ├─ data.js
│  └─ mongodb.js
├─ scripts/
│  └─ seed.mjs
├─ .env.example
├─ .gitignore
├─ next.config.mjs
├─ package.json
└─ README.md
```

## 로그인에 대해

현재 `/login`은 실제 인증 서버를 구현하기 전의 UI/라우팅 예제입니다.

아이디와 비밀번호를 입력하면 `/admin`으로 이동합니다. 실제 서비스에서는 세션 기반 인증, 비밀번호 해싱, 권한 확인을 추가해야 합니다.

## MongoDB 동작 방식

`lib/mongodb.js`에서 `MongoClient` 연결을 공용으로 재사용합니다. 개발 중 hot reload가 발생해도 연결을 계속 재사용하도록 개발 환경에서 전역 promise를 캐시합니다.

MongoDB 연결이 없는 상태에서는 `lib/data.js`의 기본 데이터를 사용해 화면을 볼 수 있습니다.

## 주의

- `.env.local`은 Git에 올리지 마세요.
- MongoDB 비밀번호를 소스 코드에 직접 작성하지 마세요.
- 운영 환경에서는 관리자 인증/권한 검사를 반드시 추가하세요.
- 행사 삭제는 MongoDB 연결이 있을 때 실제 DB에서 삭제됩니다.
