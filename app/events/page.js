"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import PageShell from "../../components/page-shell";

const CATEGORIES = ["전체", "체육", "축제", "동아리", "학술", "전시", "기타"];
const STATUSES = ["전체", "모집중", "진행중", "마감", "종료"];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error("행사 목록 불러오기 오류:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // 필터링 및 검색 계산
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchCategory =
        selectedCategory === "전체" || event.category === selectedCategory;
      const matchStatus =
        selectedStatus === "전체" || (event.status || "모집중") === selectedStatus;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        event.name?.toLowerCase().includes(query) ||
        event.place?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.target?.toLowerCase().includes(query);

      return matchCategory && matchStatus && matchSearch;
    });
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  // 카테고리별 개수 카운트
  const categoryCounts = useMemo(() => {
    const counts = { 전체: events.length };
    for (const e of events) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }
    return counts;
  }, [events]);

  function getStatusClass(status) {
    switch (status) {
      case "모집중":
        return "recruiting";
      case "진행중":
        return "ongoing";
      case "마감":
        return "closed";
      case "종료":
        return "ended";
      default:
        return "recruiting";
    }
  }

  return (
    <PageShell>
      <main className="page">
        <p className="eyebrow">EVENTS</p>
        <h1 className="page-title">학교 행사</h1>
        <p className="page-description">
          체육대회, 축제, 동아리 발표회 등 학교에서 진행되는 모든 행사를 확인하고 참가 신청하세요.
        </p>

        {/* 툴바: 검색창 + 필터 그룹 */}
        <div className="event-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="행사명, 장소, 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-groups">
            {/* 카테고리 필터 */}
            <div className="filter-row" style={{ marginTop: 0 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                  <span className="pill-count">{categoryCounts[cat] || 0}</span>
                </button>
              ))}
            </div>

            {/* 상태 필터 */}
            <div className="filter-row" style={{ marginTop: 0 }}>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  style={{ height: "36px", fontSize: "12px", minWidth: "60px" }}
                  className={`pill ${selectedStatus === st ? "active" : ""}`}
                  onClick={() => setSelectedStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 행사 카드 그리드 */}
        <div className="cards-3 event-grid">
          {loading ? (
            <div className="empty-box">
              <p>행사 목록을 불러오는 중입니다...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-box">
              <h3>조건에 맞는 행사가 없습니다</h3>
              <p className="muted" style={{ marginBottom: "16px" }}>
                다른 검색어나 필터를 선택해보세요.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setSelectedCategory("전체");
                  setSelectedStatus("전체");
                  setSearchQuery("");
                }}
              >
                전체 행사 보기
              </button>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const capacity = Number(event.capacity) || 0;
              const registered = Number(event.registeredCount) || 0;
              const percent = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
              const status = event.status || "모집중";

              return (
                <article key={event._id} className="event-card-rich">
                  <div>
                    <div className="event-card-header">
                      <div className="event-card-icon">{event.icon || "📌"}</div>
                      <div className="event-card-badges">
                        <span className="category-tag">{event.category || "기타"}</span>
                        <span className={`status-badge ${getStatusClass(status)}`}>
                          ● {status}
                        </span>
                      </div>
                    </div>

                    <div className="event-card-body">
                      <h3>{event.name}</h3>
                      <p className="event-card-desc">{event.description || "설명이 등록되지 않았습니다."}</p>

                      <div className="event-card-meta">
                        <span>📅 {event.date}</span>
                        <span>📍 {event.place}</span>
                        {event.target && <span>🎯 대상: {event.target}</span>}
                      </div>

                      {capacity > 0 && (
                        <div className="capacity-progress">
                          <div className="capacity-info">
                            <span>신청 현황</span>
                            <span>
                              <strong>{registered}</strong> / {capacity}명 ({percent}%)
                            </span>
                          </div>
                          <div className="capacity-track">
                            <div
                              className={`capacity-fill ${percent >= 100 ? "full" : ""}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <span className="muted" style={{ fontSize: "12px" }}>
                      {status === "모집중" ? "지금 신청 가능" : status}
                    </span>
                    <Link className="link" href={`/events/${event._id}`}>
                      자세히 보기 & 신청 →
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </PageShell>
  );
}
