import Link from "next/link";
import PageShell from "../../components/page-shell";
import { getCompetitions, getMatches } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function CompetitionPage() {
  const competitions = await getCompetitions();
  const matches = await getMatches();
  const comp = competitions[0];

  return (
    <PageShell>
      <main className="page">
        <h1 className="page-title">{comp?.name || "대회 정보"}</h1>
        {comp && (
          <p className="muted">
            {comp.startDate || "-"} — {comp.endDate || "-"}
          </p>
        )}

        <div className="tabs">
          <Link className="pill active" href="/competition">대회 정보</Link>
          <Link className="pill" href="/schedule">경기 일정</Link>
          <Link className="pill" href="/results">경기 결과</Link>
          <Link className="pill" href="/ranking">순위표</Link>
        </div>

        {!comp ? (
          <div className="card" style={{ padding: "60px 20px", textAlign: "center", marginTop: "34px", borderRadius: "16px" }}>
            <h3>등록된 대회가 없습니다</h3>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              관리자가 새로운 대회를 등록하면 이곳에 대회 정보가 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            <div className="stats-row">
              <div className="card stat-card"><b>{comp.games ?? 0}</b><span>전체 경기</span></div>
              <div className="card stat-card"><b>{comp.playedGames ?? 0}</b><span>진행된 경기</span></div>
              <div className="card stat-card"><b>{comp.teams ?? 0}</b><span>참가 팀</span></div>
            </div>

            <section className="progress-section">
              <h2>대회 진행률</h2>
              <div className="progress-line">
                <strong>{comp.progress ?? 0}%</strong>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${comp.progress ?? 0}%` }} />
                </div>
              </div>
              <p>{comp.status ? `현재 ${comp.status} 상태입니다.` : "진행 상황을 확인하세요."}</p>
            </section>

            <section className="recent-section">
              <h2>최근 경기</h2>
              {matches.filter((m) => m.status === "경기 종료" || m.status === "종료").length === 0 ? (
                <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                  <p className="muted" style={{ margin: 0 }}>최근 종료된 경기가 없습니다.</p>
                </div>
              ) : (
                <div className="match-grid">
                  {matches
                    .filter((m) => m.status === "경기 종료" || m.status === "종료")
                    .slice(0, 2)
                    .map((match) => (
                      <div key={match._id} className="card match-card">
                        <b>
                          {match.home || match.homeTeam} &nbsp;&nbsp; {match.homeScore ?? "-"} : {match.awayScore ?? "-"} &nbsp;&nbsp; {match.away || match.awayTeam}
                        </b>
                        <span>경기 종료</span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </PageShell>
  );
}
