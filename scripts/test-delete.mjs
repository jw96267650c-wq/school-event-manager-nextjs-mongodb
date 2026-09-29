import { getEvents } from "../lib/data.js";
import { getDb, clientPromise } from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

const eventsBefore = await getEvents();
console.log("현재 등록된 행사 수:", eventsBefore.length);

// 1. 임시 테스트 행사 추가
const db = await getDb();
const insertRes = await db.collection("events").insertOne({
  icon: "🧪",
  name: "삭제 테스트용 행사",
  date: "2026.12.31",
  place: "테스트실",
  category: "기타",
  status: "모집중",
  createdAt: new Date()
});

const testId = insertRes.insertedId.toString();
console.log("테스트 행사 생성:", testId);

const eventsWithTest = await getEvents();
console.log("생성 후 행사 수:", eventsWithTest.length);

// 2. 삭제 실행
const filter = ObjectId.isValid(testId)
  ? { $or: [{ _id: new ObjectId(testId) }, { _id: testId }] }
  : { _id: testId };

const delRes = await db.collection("events").deleteOne(filter);
console.log("삭제 결과 deletedCount:", delRes.deletedCount);

// 3. 삭제 후 확인
const eventsAfter = await getEvents();
console.log("삭제 후 행사 수:", eventsAfter.length);
const stillExists = eventsAfter.some((e) => e._id === testId);
console.log("삭제된 행사가 목록에 남아있는가?:", stillExists);

const client = await clientPromise;
await client.close();
