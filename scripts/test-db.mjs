import { MongoClient } from "mongodb";
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

console.log("==========================================");
console.log("🔍 MongoDB 연결 테스트 시작");
console.log(`📌 URI: ${uri}`);
console.log(`📌 Database: ${dbName}`);
console.log("==========================================");

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });

try {
  await client.connect();
  console.log("✅ MongoDB 연결 성공!");

  const db = client.db(dbName);
  const ping = await db.command({ ping: 1 });
  console.log("✅ 핑 응답:", ping);

  const collections = await db.listCollections().toArray();
  console.log(`\n📦 컬렉션 목록 (${collections.length}개):`);

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   - ${col.name}: ${count}개 문서`);
  }

  console.log("\n🎉 로컬 MongoDB 연동이 정상적으로 작동하고 있습니다!");
} catch (error) {
  console.error("❌ MongoDB 연결 실패:", error.message);
  console.log("\n💡 확인 사항:");
  console.log("1. 로컬에 MongoDB 서비스가 실행 중인지 확인하세요. (예: brew services start mongodb-community)");
  console.log("2. 기본 포트(27017)가 열려 있는지 확인하세요.");
  console.log("3. .env.local 파일의 MONGODB_URI 설정을 확인하세요.");
  process.exit(1);
} finally {
  await client.close();
}
