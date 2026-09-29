import PageShell from "../../components/page-shell";
import { getMatches, getCompetitions } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const [matches, competitions] = await Promise.all([
    getMatches(),
    getCompetitions(),
  ]);

  const activeComp = competitions[0];
  const finishedMatches = (matches || []).filter(
    (m) => (m.status === "경기 종료" || m.status === "종료") &&
      m.homeScore !== null &&
      m.awayScore !== null
  );

  // 팀별 성적 집계 (승: 3점, 무: 1점, 패: 0점)
  const teamStats = {};

  finishedMatches.forEach((m) => {
    const home = m.homeTeam || m.home;
    const away = m.awayTeam || m.away;
    const hScore = Number(m.homeScore);
    const aScore = Number(m.awayScore);

    if (!home || !away) return;

    if (!teamStats[home]) teamStats[home] = { team: home, played: 0, win: 0, draw: 0, loss: 0, points: 0 };
    if (!teamStats[away]) teamStats[away] = { team: away, played: 0, win: 0, draw: 0, loss: 0, points: 0 };

    teamStats[home].played += 1;
    teamStats[away].played += 1;

    if (hScore > aScore) {
      teamStats[home].win += 1;
      teamStats[home].points += 3;
      teamStats[away].loss += 1;
    } else if (hScore < aScore) {
      teamStats[away].win += 1;
      teamStats[away].points += 3;
      teamStats[home].loss += 1;
    } else {
      teamStats[home].draw += 1;
      teamStats[home].points += 1;
      teamStats[away].draw += 1;
      teamStats[away].points += 1;
    }
  });

  // 승점 높은 순으로 정렬
  const rankedTeams = Object.values(teamStats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.win !== a.win) return b.win - a.win;
    return a.loss - b.loss;
  });

  return (
    <PageShell>
      <main className="page">
        <h1 className="page-title">대회 순위</h1>
        <p className="muted">{activeComp?.name || "교내 대회"} · 현재 순위표</p>

        {rankedTeams.length === 0 ? (
          <div className="card" style={{ padding: "60px 20px", textAlign: "center", marginTop: "34px", borderRadius: "16px" }}>
            <h3>등록된 경기 결과가 없습니다</h3>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              경기가 진행되고 스코어가 입력되면 자동으로 순위가 집계되어 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="card ranking-box" style={{ height: "auto" }}>
            <table>
              <thead>
                <tr>
                  {["순위", "팀", "경기", "승", "무", "패", "승점"].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankedTeams.map((t, idx) => (
                  <tr key={t.team}>
                    <td><strong>{idx + 1}</strong></td>
                    <td><strong>{t.team}</strong></td>
                    <td>{t.played}</td>
                    <td style={{ color: "#2ed573" }}>{t.win}</td>
                    <td>{t.draw}</td>
                    <td style={{ color: "#ff4757" }}>{t.loss}</td>
                    <td><b style={{ color: "#2996ff", fontSize: "16px" }}>{t.points}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="ranking-note">승리 3점 · 무승부 1점 · 패배 0점</p>
      </main>
    </PageShell>
  );
}
