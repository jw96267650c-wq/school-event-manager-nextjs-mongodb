"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import PageShell from "../../../components/page-shell";

export default function EventDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    contact: "",
    note: "",
  });

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (err) {
        console.error("행사 정보 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadEvent();
    }
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegisterError(data.error || "신청에 실패했습니다.");
        return;
      }

      setRegisterSuccess(data.message || "참가 신청이 완료되었습니다!");
      // 신청 완료 후 이벤트 등록자 수 갱신
      if (data.newRegisteredCount !== undefined) {
        setEvent((prev) => ({
          ...prev,
          registeredCount: data.newRegisteredCount,
        }));
      }

      // 폼 리셋
      setForm({ name: "", studentId: "", contact: "", note: "" });

      // 1.5초 후 모달 닫기
      setTimeout(() => {
        setIsModalOpen(false);
        setRegisterSuccess("");
      }, 1800);
    } catch (err) {
      console.error(err);
      setRegisterError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "모집중":
        return <span className="status-badge recruiting">● 모집중</span>;
      case "진행중":
        return <span className="status-badge ongoing">● 진행중</span>;
      case "마감":
        return <span className="status-badge closed">● 모집 마감</span>;
      case "종료":
        return <span className="status-badge ended">● 행사 종료</span>;
      default:
        return <span className="status-badge recruiting">● {status}</span>;
    }
  }

  if (loading) {
    return (
      <PageShell>
        <main className="page">
          <Link href="/events" className="back-link">← 행사 목록</Link>
          <div className="card" style={{ padding: "40px", marginTop: "24px", textAlign: "center" }}>
            <p>행사 상세 정보를 불러오는 중입니다...</p>
          </div>
        </main>
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell>
        <main className="page">
          <Link href="/events" className="back-link">← 행사 목록</Link>
          <div className="card" style={{ padding: "40px", marginTop: "24px", textAlign: "center" }}>
            <h2>행사를 찾을 수 없습니다</h2>
            <p className="muted" style={{ margin: "16px 0" }}>요청하신 행사가 존재하지 않거나 삭제되었습니다.</p>
            <Link href="/events" className="button primary">행사 목록으로 가기</Link>
          </div>
        </main>
      </PageShell>
    );
  }

  const capacity = Number(event.capacity) || 0;
  const registered = Number(event.registeredCount) || 0;
  const percent = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const isFull = capacity > 0 && registered >= capacity;
  const canRegister = (event.status === "모집중" || !event.status) && !isFull;

  return (
    <PageShell>
      <main className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/events" className="back-link">← 행사 목록</Link>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="category-tag">{event.category || "기타"}</span>
            {getStatusBadge(event.status || "모집중")}
          </div>
        </div>

        <h1 className="page-title detail-title">{event.name}</h1>
        <p className="muted detail-subtitle">
          📅 {event.date} · 📍 {event.place}
        </p>

        {/* Hero Visual Card */}
        <div className="card hero-card" style={{ position: "relative", overflow: "hidden" }}>
          <div className="hero-emoji">{event.icon || "📌"}</div>
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "24px",
              fontSize: "13px",
              color: "#85858f",
            }}
          >
            카테고리: {event.category || "일반"}
          </div>
        </div>

        {/* 2단 상세 안내 정보 */}
        <div className="two-column info-grid">
          <section>
            <h2>행사 소개</h2>
            <div
              className="card"
              style={{
                padding: "24px",
                lineHeight: "1.8",
                fontSize: "15px",
                whiteSpace: "pre-line",
              }}
            >
              {event.description || "등록된 행사 소개가 없습니다."}
            </div>
          </section>

          <section>
            <h2>행사 안내 및 신청 현황</h2>
            <div className="card" style={{ padding: "24px", display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                <p style={{ margin: 0 }}>
                  <strong>📅 일시:</strong> {event.date}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>📍 장소:</strong> {event.place}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>🎯 대상:</strong> {event.target || "전교생"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>📌 분류:</strong> {event.category || "기타"}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #24242e", paddingTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  <span className="muted">모집 정원 현황</span>
                  <span>
                    <strong>{registered}명</strong> / {capacity > 0 ? `${capacity}명` : "제한 없음"} ({percent}%)
                  </span>
                </div>
                {capacity > 0 && (
                  <div className="capacity-track" style={{ height: "8px" }}>
                    <div
                      className={`capacity-fill ${percent >= 100 ? "full" : ""}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* 참가 신청 버튼 */}
              <div style={{ marginTop: "8px" }}>
                {canRegister ? (
                  <button
                    className="button primary full"
                    onClick={() => setIsModalOpen(true)}
                  >
                    ✍️ 행사 참가 신청하기
                  </button>
                ) : (
                  <button className="button full" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    {isFull ? "정원 마감" : event.status === "종료" ? "종료된 행사" : "신청 마감"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* 연관 바로가기 버튼 */}
        <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
          {event.category === "체육" && (
            <Link href="/schedule" className="button primary">
              🏀 교내 경기 일정 보기 →
            </Link>
          )}
          <Link href="/events" className="button">
            목록으로 돌아가기
          </Link>
        </div>

        {/* 참가 신청 팝업 모달 */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>행사 참가 신청</h2>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                    {event.icon} {event.name}
                  </p>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {registerSuccess ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    background: "rgba(46,213,115,.15)",
                    border: "1px solid rgba(46,213,115,.35)",
                    borderRadius: "14px",
                    color: "#2ed573",
                  }}
                >
                  <p style={{ fontSize: "24px", margin: "0 0 8px" }}>🎉</p>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>{registerSuccess}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#f5f5fa" }}>
                    참가 명단에 등록되었습니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="modal-body">
                    {registerError && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,71,87,.15)",
                          border: "1px solid rgba(255,71,87,.35)",
                          borderRadius: "10px",
                          color: "#ff4757",
                          fontSize: "13px",
                        }}
                      >
                        ⚠️ {registerError}
                      </div>
                    )}

                    <label>
                      이름 <span style={{ color: "#ff4757" }}>*</span>
                      <input
                        name="name"
                        required
                        placeholder="예: 홍길동"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      학년 / 반 / 번호 <span style={{ color: "#ff4757" }}>*</span>
                      <input
                        name="studentId"
                        required
                        placeholder="예: 2학년 3반 15번"
                        value={form.studentId}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      연락처 (휴대전화) <span style={{ color: "#ff4757" }}>*</span>
                      <input
                        name="contact"
                        required
                        placeholder="예: 010-1234-5678"
                        value={form.contact}
                        onChange={handleChange}
                      />
                    </label>

                    <label>
                      신청 사유 또는 비고
                      <textarea
                        name="note"
                        placeholder="신청 사유, 동아리명, 참가 희망 종목 등을 적어주세요."
                        value={form.note}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="button primary"
                      disabled={submitting}
                    >
                      {submitting ? "신청 처리 중..." : "신청 제출하기"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </PageShell>
  );
}
