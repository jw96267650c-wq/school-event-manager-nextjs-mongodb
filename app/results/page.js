import Link from "next/link";
import PageShell from "../../components/page-shell";
import { getMatches } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const allMatches = await getMatches();
  const matches = (allMatches || []).filter((m) => m.status === "경기 종료" || m.status === "종료");

  return (
    <PageShell>
      <main className="page">
        <h1 className="page-title">경기 결과</h1>
        <p className="muted">종료된 경기 결과 목록 ({matches.length}경기)</p>
        <div className="results-list">
          {matches.length === 0 ? (
            <p className="muted" style={{ padding: "30px 0" }}>종료된 경기 결과가 아직 없습니다.</p>
          ) : (
            matches.map((match) => (
              <article key={match._id} className="card result-card">
                <strong>{match.home || match.homeTeam} &nbsp;&nbsp; {match.homeScore ?? "-"} : {match.awayScore ?? "-"} &nbsp;&nbsp; {match.away || match.awayTeam}</strong>
                <Link className="link" href="/results">경기 종료 · 경기 상세 →</Link>
              </article>
            ))
          )}
        </div>
      </main>
    </PageShell>
  );
}
