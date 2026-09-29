import { MongoClient } from "mongodb";

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/school-event-manager";
const uri = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;
const dbName = process.env.MONGODB_DB || "school-event-manager";

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // 개발 환경에서는 HMR(Hot Module Replacement)로 인한 다중 연결 방지를 위해 글로벌 캐시 사용
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      // 연결 실패 시 캐시를 비워 재연결 가능하도록 처리
      global._mongoClientPromise = null;
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * MongoDB 데이터베이스 객체 반환 헬퍼 함수
 * 연결 실패 시 에러를 로깅하고 null을 반환하여 기본 데이터(fallback)로 안전하게 동작합니다.
 */
export async function getDb() {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (error) {
    console.error("MongoDB 연결 오류:", error.message);
    return null;
  }
}

export { clientPromise };
export default clientPromise;

