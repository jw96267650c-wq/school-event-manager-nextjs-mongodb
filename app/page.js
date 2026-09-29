import Link from "next/link";
import PageShell from "../components/page-shell";
import { getEvents } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();

  return (
    <PageShell>
      <main className="page">
        <section className="hero">
          <h1>학교의 모든 행사를<br />한눈에.</h1>
          <p>행사부터 경기 결과까지 하나의 공간에서 편리하게 확인하세요.</p>
          <Link className="button primary" href="/events">행사 보기 →</Link>
        </section>

        <section className="section">
          <h2 className="muted">예정된 행사</h2>
          {events.length === 0 ? (
            <div className="card" style={{ padding: "40px 20px", textAlign: "center", borderRadius: "16px" }}>
              <p className="muted" style={{ margin: 0 }}>현재 등록된 행사가 없습니다.</p>
            </div>
          ) : (
            <div className="cards-3 home-events">
              {events.slice(0, 3).map((event) => (
                <article key={event._id} className="card event-card large" style={{ height: "auto", minHeight: "260px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="emoji" style={{ marginBottom: 0 }}>{event.icon}</div>
                    <span className={`status-badge ${event.status === "모집중" ? "recruiting" : event.status === "진행중" ? "ongoing" : "closed"}`}>
                      ● {event.status || "모집중"}
                    </span>
                  </div>
                  <h3 style={{ marginTop: "16px" }}>{event.name}</h3>
                  <p className="muted" style={{ margin: "4px 0" }}>📅 {event.date}</p>
                  <p className="muted" style={{ margin: "4px 0" }}>📍 {event.place}</p>
                  <Link className="link" href={`/events/${event._id}`} style={{ marginTop: "12px", display: "inline-block" }}>자세히 보기 & 참가 신청 →</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}
