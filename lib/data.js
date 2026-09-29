function serialize(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id?.toString?.() ?? String(doc._id) };
}

export async function getEvents(query = {}) {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) {
    return [];
  }

  const filter = {};
  if (query.category && query.category !== "전체") {
    filter.category = query.category;
  }
  if (query.status && query.status !== "전체") {
    filter.status = query.status;
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { place: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } }
    ];
  }

  const docs = await db.collection("events").find(filter).sort({ createdAt: -1, date: 1 }).toArray();
  return docs.map(serialize);
}

export async function getEvent(id) {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) {
    return null;
  }
  const { ObjectId } = await import("mongodb");
  let doc = null;
  if (ObjectId.isValid(id)) {
    doc = await db.collection("events").findOne({
      $or: [{ _id: new ObjectId(id) }, { _id: id }]
    });
  } else {
    doc = await db.collection("events").findOne({ _id: id });
  }
  return serialize(doc);
}

export async function getEventRegistrations(eventId) {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) {
    return [];
  }
  const docs = await db.collection("event_registrations").find({
    $or: [{ eventId }, { eventId: String(eventId) }]
  }).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}


export async function getCompetitions() {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) return [];
  const docs = await db.collection("competitions").find({}).sort({ startDate: 1 }).toArray();
  return docs.map(serialize);
}

export async function getMatches() {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) return [];
  const docs = await db.collection("matches").find({}).sort({ date: 1, time: 1 }).toArray();
  return docs.map(serialize);
}

export async function getNotices() {
  const db = await (await import("./mongodb.js")).getDb();
  if (!db) return [];
  const docs = await db.collection("notices").find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}
