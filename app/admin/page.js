import AdminLayout from "../../components/admin-layout";
import { getEvents, getCompetitions, getMatches } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [events, comps, matches] = await Promise.all([
    getEvents(),
    getCompetitions(),
    getMatches(),
  ]);

  const ongoingComps = comps.filter((c) => c.status === "진행중").length;
  const totalMatches = matches.length;

  return (
    <AdminLayout active="/admin">
      <div className="admin-title-row">
        <div>
          <h1>관리자 대시보드</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            학교 행사, 대회 일정, 경기 스코어 및 공지사항 현황입니다.
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <b>{events.length}</b>
          <span>등록된 행사</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2ed573" }}>{ongoingComps}</b>
          <span>진행 중 대회</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2996ff" }}>{totalMatches}</b>
          <span>전체 경기 일정</span>
        </div>
      </div>

      <section className="admin-recent">
        <h2>최근 등록된 행사</h2>
        {events.length === 0 ? (
          <div className="card" style={{ padding: "30px", textAlign: "center", width: "805px" }}>
            <p className="muted" style={{ margin: 0 }}>등록된 행사가 없습니다.</p>
          </div>
        ) : (
          events.slice(0, 4).map((e) => (
            <div key={e._id} className="recent-row">
              <span style={{ fontWeight: 600 }}>{e.icon} {e.name}</span>
              <span className="muted">{e.date}</span>
            </div>
          ))
        )}
      </section>
    </AdminLayout>
  );
}
