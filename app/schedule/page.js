"use client";

import { useEffect, useState, useMemo } from "react";
import PageShell from "../../components/page-shell";

export default function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("전체");

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const res = await fetch("/api/matches");
        if (res.ok) {
          const data = await res.json();
          setMatches(Array.isArray(data) ? data : data.matches || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  // 예정된 경기만 필터링
  const upcomingMatches = useMemo(() => {
    return matches.filter((m) => m.status !== "경기 종료" && m.status !== "종료");
  }, [matches]);

  // 실제 등록된 경기들에서 유니크한 날짜 목록 추출
  const availableDates = useMemo(() => {
    const dates = new Set();
    upcomingMatches.forEach((m) => {
      if (m.date) dates.add(m.date);
    });
    return ["전체", ...Array.from(dates)];
  }, [upcomingMatches]);

  const filteredMatches = useMemo(() => {
    if (selectedDate === "전체") return upcomingMatches;
    return upcomingMatches.filter((m) => m.date === selectedDate);
  }, [upcomingMatches, selectedDate]);

  return (
    <PageShell>
      <main className="page">
        <h1 className="page-title">경기 일정</h1>
        <p className="page-description">진행 예정인 교내 스포츠 및 대회 경기 일정입니다.</p>

        {/* 실제 등록된 경기 날짜 기반 동적 필터 */}
        {availableDates.length > 2 && (
          <div className="filter-row">
            {availableDates.map((date) => (
              <button
                key={date}
                className={`pill ${selectedDate === date ? "active" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </div>
        )}

        <div className="schedule-list">
          {loading ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <p className="muted" style={{ margin: 0 }}>경기 일정을 불러오는 중입니다...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <p className="muted" style={{ margin: 0 }}>예정된 경기 일정이 없습니다.</p>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <article key={match._id} className="card schedule-card">
                <span>{match.date ? `${match.date} ` : ""}{match.time || ""}</span>
                <strong>
                  {match.home || match.homeTeam} &nbsp;&nbsp; VS &nbsp;&nbsp; {match.away || match.awayTeam}
                </strong>
                <span className="muted">{match.place || match.venue || "장소 미정"}</span>
                <em>{match.status || "예정"}</em>
              </article>
            ))
          )}
        </div>
      </main>
    </PageShell>
  );
}
