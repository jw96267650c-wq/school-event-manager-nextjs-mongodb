"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin-layout";

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [matchesRes, compRes] = await Promise.all([
        fetch("/api/matches"),
        fetch("/api/competitions"),
      ]);

      if (matchesRes.ok) {
        const mData = await matchesRes.json();
        setMatches(Array.isArray(mData) ? mData : mData.matches || []);
      }
      if (compRes.ok) {
        const cData = await compRes.json();
        setCompetitions(Array.isArray(cData) ? cData : cData.competitions || []);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  function getCompetitionName(competitionId) {
    const comp = competitions.find(
      (item) => String(item._id) === String(competitionId)
    );
    return comp?.name || "일반 경기";
  }

  // 경기 상태 빠른 변경
  async function handleStatusChange(match, newStatus) {
    try {
      const res = await fetch(`/api/matches/${match._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: match.competitionId,
          homeTeam: match.homeTeam || match.home,
          awayTeam: match.awayTeam || match.away,
          date: match.date,
          time: match.time,
          venue: match.venue || match.place,
          status: newStatus,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        }),
      });

      if (res.ok) {
        setMatches((prev) =>
          prev.map((m) => (m._id === match._id ? { ...m, status: newStatus } : m))
        );
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  }

  // 경기 삭제
  async function handleDelete(match) {
    const matchName = `${match.homeTeam || match.home || "팀A"} vs ${match.awayTeam || match.away || "팀B"}`;
    if (!window.confirm(`"${matchName}" 경기 일정을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/matches/${match._id}`, { method: "DELETE" });
      if (res.ok) {
        setMatches((prev) => prev.filter((m) => m._id !== match._id));
        alert("경기가 삭제되었습니다.");
      } else {
        alert("경기 삭제 실패");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  }

  const total = matches.length;
  const scheduled = matches.filter((m) => m.status === "예정" || m.status === "경기 예정").length;
  const finished = matches.filter((m) => m.status === "종료" || m.status === "경기 종료").length;

  return (
    <AdminLayout active="/admin/matches">
      <div className="admin-title-row">
        <div>
          <h1>경기 관리</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            대회별 대진 일정과 경기 결과를 등록하고 실시간 스코어를 관리하세요.
          </p>
        </div>
        <Link className="button primary" href="/admin/matches/new">
          ＋ 새 경기 등록
        </Link>
      </div>

      {/* 요약 통계 카드 */}
      <div className="stats-row" style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div className="card stat-card">
          <b>{total}</b>
          <span className="muted">총 경기 수</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2996ff" }}>{scheduled}</b>
          <span className="muted">예정된 경기</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2ed573" }}>{finished}</b>
          <span className="muted">종료된 경기</span>
        </div>
      </div>

      {/* 경기 목록 테이블 */}
      <div className="card admin-list">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>경기 일정을 불러오는 중입니다...</p>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>등록된 경기 일정이 없습니다.</h3>
            <p className="muted">새로운 경기를 등록해보세요.</p>
            <Link
              className="button primary"
              href="/admin/matches/new"
              style={{ marginTop: "12px" }}
            >
              경기 등록하기
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>대회</th>
                <th>대진 (홈 vs 원정)</th>
                <th>일시</th>
                <th>장소</th>
                <th>상태</th>
                <th>점수</th>
                <th style={{ textAlign: "right" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => {
                const home = match.homeTeam || match.home || "-";
                const away = match.awayTeam || match.away || "-";
                const venue = match.venue || match.place || "-";
                const hasScore =
                  match.homeScore !== null &&
                  match.homeScore !== undefined &&
                  match.awayScore !== null &&
                  match.awayScore !== undefined;

                return (
                  <tr key={match._id}>
                    <td>
                      <span className="category-tag">
                        {getCompetitionName(match.competitionId)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "15px" }}>{home}</strong>
                      <span className="muted" style={{ margin: "0 6px" }}>vs</span>
                      <strong style={{ fontSize: "15px" }}>{away}</strong>
                    </td>
                    <td className="muted">
                      {match.date || "-"} {match.time ? `(${match.time})` : ""}
                    </td>
                    <td>{venue}</td>
                    <td>
                      <select
                        className="status-select"
                        value={match.status || "예정"}
                        onChange={(e) => handleStatusChange(match, e.target.value)}
                      >
                        <option value="예정">예정</option>
                        <option value="진행중">진행중</option>
                        <option value="종료">종료</option>
                        <option value="연기">연기</option>
                        <option value="취소">취소</option>
                      </select>
                    </td>
                    <td>
                      {hasScore ? (
                        <b style={{ color: "#2ed573", fontSize: "15px" }}>
                          {match.homeScore} : {match.awayScore}
                        </b>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                        <Link
                          className="text-button link"
                          href={`/admin/matches/${match._id}/edit`}
                          style={{ fontWeight: 600 }}
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => handleDelete(match)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}