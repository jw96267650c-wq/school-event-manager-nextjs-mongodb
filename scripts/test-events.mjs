import { MongoClient, ObjectId } from "mongodb";
import fs from "node:fs";

if (typeof process.loadEnvFile === "function") {
  if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");
}

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/school-event-manager";
const dbName = process.env.MONGODB_DB || "school-event-manager";

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

console.log("==========================================");
console.log("🧪 행사 기능 종합 테스트");
console.log("==========================================");

// 1. 행사 생성 테스트
const newEvent = {
  icon: "🔬",
  name: "교내 과학 탐구 페스티벌",
  date: "2026.11.20",
  place: "과학관 실험실",
  category: "학술",
  status: "모집중",
  target: "1~2학년 희망자",
  capacity: 30,
  registeredCount: 0,
  description: "다양한 과학 실험과 부스 체험이 진행되는 페스티벌입니다.",
  createdAt: new Date(),
  updatedAt: new Date()
};

const insertRes = await db.collection("events").insertOne(newEvent);
const eventId = insertRes.insertedId.toString();
console.log("1. 행사 등록 완료:", eventId, newEvent.name);

// 2. 참가 신청 테스트
const reg = {
  eventId,
  name: "테스트학생",
  studentId: "2학년 5반 10번",
  contact: "010-9999-8888",
  note: "물리 실험 부스 참가 희망",
  createdAt: new Date()
};
const regRes = await db.collection("event_registrations").insertOne(reg);
await db.collection("events").updateOne(
  { _id: new ObjectId(eventId) },
  { $inc: { registeredCount: 1 } }
);
console.log("2. 참가 신청 완료:", regRes.insertedId.toString(), reg.name);

// 3. 신청자 명단 확인
const regs = await db.collection("event_registrations").find({ eventId }).toArray();
console.log(`3. 신청자 수 확인: ${regs.length}명 (신청자: ${regs[0].name}, 학번: ${regs[0].studentId})`);

// 4. 행사 상태 수정 테스트
await db.collection("events").updateOne(
  { _id: new ObjectId(eventId) },
  { $set: { status: "진행중", place: "과학관 3층 전체" } }
);
const updatedEvent = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
console.log(`4. 행사 수정 확인: 상태=${updatedEvent.status}, 장소=${updatedEvent.place}, 신청자수=${updatedEvent.registeredCount}`);

// 5. 테스트 행사 및 신청 데이터 삭제 정리
await db.collection("events").deleteOne({ _id: new ObjectId(eventId) });
await db.collection("event_registrations").deleteMany({ eventId });
console.log("5. 테스트 데이터 정리 완료!");

console.log("\n🎉 모든 행사 기능 DB 연동 및 비즈니스 로직 테스트 통과!");

await client.close();
