import { MongoClient } from "mongodb";
import crypto from "node:crypto";
import fs from "node:fs";

// .env.local 또는 .env 파일이 있으면 환경 변수 로드
if (typeof process.loadEnvFile === "function") {
  if (fs.existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  } else if (fs.existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/school-event-manager";
const uri = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;
const dbName = process.env.MONGODB_DB || "school-event-manager";

console.log(`MongoDB 연결 중: ${uri} (DB: ${dbName})`);
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);


await db.collection("events").deleteMany({});
await db.collection("event_registrations").deleteMany({});
await db.collection("competitions").deleteMany({});
await db.collection("matches").deleteMany({});
await db.collection("notices").deleteMany({});

const eventDocs = await db.collection("events").insertMany([
  {
    icon: "🏀",
    name: "교내 농구대회",
    date: "2026.09.05 ~ 09.10",
    place: "학교 체육관",
    category: "체육",
    status: "진행중",
    target: "전교생 (학급별)",
    capacity: 60,
    registeredCount: 48,
    description: "학생들의 체력 증진과 친목을 위해 진행되는 3대3 교내 농구대회입니다. 학급별 대표팀이 토너먼트 형식으로 맞붙습니다.",
    createdAt: new Date()
  },
  {
    icon: "⚽",
    name: "교내 축구대회",
    date: "2026.09.12 ~ 09.18",
    place: "학교 운동장",
    category: "체육",
    status: "모집중",
    target: "1~3학년 전교생",
    capacity: 100,
    registeredCount: 64,
    description: "학급 간 친선과 협동을 위한 교내 축구대회입니다. 우승 팀에게는 트로피와 소정의 상품이 수여됩니다.",
    createdAt: new Date()
  },
  {
    icon: "🎤",
    name: "학교 가을 축제 (청송제)",
    date: "2026.10.20",
    place: "학교 대강당 및 운동장",
    category: "축제",
    status: "모집중",
    target: "전교생 및 교직원, 학부모",
    capacity: 300,
    registeredCount: 185,
    description: "학생들이 함께 준비하고 즐기는 학교 가을 축제입니다. 동아리 부스 체험, 버스킹 무대, 먹거리 장터가 운영됩니다.",
    createdAt: new Date()
  },
  {
    icon: "🎨",
    name: "가을 미술 작품 전시회",
    date: "2026.10.10 ~ 10.14",
    place: "본관 1층 로비 및 미술실",
    category: "전시",
    status: "모집중",
    target: "미술 동아리 및 희망 학생",
    capacity: 40,
    registeredCount: 22,
    description: "학생들의 1년 간 예술 창작 활동 결과를 공유하고 감상하는 미술 작품 전시 행사입니다.",
    createdAt: new Date()
  },
  {
    icon: "🎵",
    name: "가을 정기 동아리 발표회",
    date: "2026.10.15",
    place: "학교 소강당",
    category: "동아리",
    status: "모집중",
    target: "교내 모든 동아리",
    capacity: 80,
    registeredCount: 35,
    description: "각 동아리의 활동 성과를 발표하고 신규 부원을 모집하는 정기 발표회입니다.",
    createdAt: new Date()
  },
  {
    icon: "📚",
    name: "도서관 독서 골든벨 대회",
    date: "2026.11.05",
    place: "도서관 시청각실",
    category: "학술",
    status: "모집중",
    target: "전교생 (선착순 50명)",
    capacity: 50,
    registeredCount: 18,
    description: "지정 도서를 읽고 퀴즈를 맞히는 독서 골든벨 대회입니다. 풍성한 도서상품권이 준비되어 있습니다.",
    createdAt: new Date()
  }
]);

// 첫 번째 행사에 대한 샘플 참가 신청 데이터 추가
const firstEventId = eventDocs.insertedIds[0].toString();
await db.collection("event_registrations").insertMany([
  { eventId: firstEventId, name: "김민준", studentId: "2학년 3반 12번", contact: "010-1234-5678", note: "농구부 주장입니다.", createdAt: new Date() },
  { eventId: firstEventId, name: "이서연", studentId: "2학년 1반 5번", contact: "010-2345-6789", note: "참가 신청합니다.", createdAt: new Date() },
  { eventId: firstEventId, name: "박도현", studentId: "1학년 4반 22번", contact: "010-3456-7890", note: "열심히 하겠습니다!", createdAt: new Date() }
]);


await db.collection("competitions").insertMany([
  { name:"교내 농구대회", startDate:"2026.09.05", endDate:"2026.09.10", games:12, playedGames:8, teams:12, progress:67, createdAt:new Date() }
]);

await db.collection("matches").insertMany([
  { date:"2026.09.05", time:"14:00", home:"1반", away:"2반", place:"학교 체육관", status:"경기 예정", homeScore:null, awayScore:null },
  { date:"2026.09.05", time:"16:00", home:"3반", away:"4반", place:"학교 체육관", status:"경기 예정", homeScore:null, awayScore:null },
  { date:"2026.09.05", time:"18:00", home:"5반", away:"6반", place:"학교 체육관", status:"경기 예정", homeScore:null, awayScore:null },
  { date:"2026.09.05", time:"19:30", home:"1반", away:"2반", place:"학교 체육관", status:"경기 종료", homeScore:32, awayScore:28 },
  { date:"2026.09.05", time:"20:30", home:"3반", away:"4반", place:"학교 체육관", status:"경기 종료", homeScore:41, awayScore:35 },
  { date:"2026.09.05", time:"21:30", home:"5반", away:"6반", place:"학교 체육관", status:"경기 종료", homeScore:28, awayScore:31 }
]);

await db.collection("notices").insertMany([
  { title:"농구대회 8강 경기 일정 안내", date:"09.01", createdAt:new Date("2026-09-01") },
  { title:"축구대회 참가팀 모집 안내", date:"08.28", createdAt:new Date("2026-08-28") },
  { title:"체육관 이용 시간 변경 안내", date:"08.25", createdAt:new Date("2026-08-25") },
  { title:"학교 축제 참가 신청 안내", date:"08.20", createdAt:new Date("2026-08-20") },
  { title:"대회 참가 명단 최종 확인 안내", date:"08.18", createdAt:new Date("2026-08-18") }
]);

const passwordHash = crypto


  .createHash("sha256")
  .update("1234")
  .digest("hex");

await db.collection("users").deleteMany({});

await db.collection("users").insertOne({
  username: "admin",
  passwordHash,
  role: "admin",
  name: "관리자",
  createdAt: new Date(),
});

await client.close();
console.log("MongoDB seed 완료");
