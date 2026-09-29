"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin-layout";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 신청자 명단 모달 상태
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [editingRegId, setEditingRegId] = useState(null);
  const [editRegForm, setEditRegForm] = useState({ name: "", studentId: "", contact: "", note: "" });
  const [savingReg, setSavingReg] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("행사 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  // 빠른 상태 변경 핸들러
  async function handleStatusChange(eventId, newStatus) {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
        );
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  }

  // 행사 삭제
  async function handleDeleteEvent(event) {
    const confirmed = window.confirm(
      `"${event.name}" 행사를 삭제하시겠습니까?\n\n관련된 참가 신청 내역도 함께 삭제됩니다.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/events/${event._id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== event._id));
        alert("행사가 삭제되었습니다.");
      } else {
        alert("행사 삭제 실패");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  // 신청자 명단 모달 열기
  async function openRegistrationsModal(event) {
    setSelectedEvent(event);
    setEditingRegId(null);
    setLoadingRegs(true);
    try {
      const res = await fetch(`/api/events/${event._id}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error(err);
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  }

  // 신청자 정보 수정 시작
  function startEditReg(reg) {
    setEditingRegId(reg._id);
    setEditRegForm({
      name: reg.name || "",
      studentId: reg.studentId || "",
      contact: reg.contact || "",
      note: reg.note || "",
    });
  }

  // 신청자 정보 수정 저장
  async function handleSaveRegistration(regId) {
    if (!editRegForm.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    setSavingReg(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent._id}/registrations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regId,
          ...editRegForm,
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, ...editRegForm } : r))
        );
        setEditingRegId(null);
        alert("신청자 정보가 수정되었습니다.");
      } else {
        const data = await res.json();
        alert(data.error || "수정 실패");
      }
    } catch (err) {
      console.error(err);
      alert("신청자 수정 중 오류가 발생했습니다.");
    } finally {
      setSavingReg(false);
    }
  }

  // 신청자 개별 삭제
  async function handleDeleteRegistration(regId) {
    if (!window.confirm("해당 학생의 참가 신청을 취소하시겠습니까?")) return;

    try {
      const res = await fetch(
        `/api/events/${selectedEvent._id}/registrations?regId=${regId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r._id !== regId));
        setEvents((prev) =>
          prev.map((e) =>
            e._id === selectedEvent._id
              ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 1) - 1) }
              : e
          )
        );
        setSelectedEvent((prev) => ({
          ...prev,
          registeredCount: Math.max(0, (prev.registeredCount || 1) - 1),
        }));
      } else {
        alert("신청 취소 실패");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  }

  const totalEvents = events.length;
  const recruitingEvents = events.filter((e) => e.status === "모집중" || !e.status).length;
  const totalRegistered = events.reduce((sum, e) => sum + (Number(e.registeredCount) || 0), 0);

  return (
    <AdminLayout active="/admin/events">
      <div className="admin-title-row">
        <div>
          <h1>행사 관리</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            교내 행사를 등록하고 참가 신청 인원과 상태를 실시간으로 관리하세요.
          </p>
        </div>
        <Link className="button primary" href="/admin/events/new">
          ＋ 새 행사 등록
        </Link>
      </div>

      {/* 요약 통계 카드 */}
      <div className="stats-row" style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div className="card stat-card">
          <b>{totalEvents}</b>
          <span className="muted">총 등록 행사</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2ed573" }}>{recruitingEvents}</b>
          <span className="muted">현재 모집 중</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2996ff" }}>{totalRegistered}</b>
          <span className="muted">총 참가 신청자</span>
        </div>
      </div>

      {/* 행사 목록 테이블 */}
      <div className="card admin-list">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>행사 목록을 불러오는 중입니다...</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>등록된 행사가 없습니다.</h3>
            <p className="muted">새로운 행사를 등록해보세요.</p>
            <Link className="button primary" href="/admin/events/new" style={{ marginTop: "12px" }}>
              행사 등록하기
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>행사명</th>
                <th>분류</th>
                <th>일시</th>
                <th>장소</th>
                <th>상태</th>
                <th>신청 현황</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const capacity = Number(event.capacity) || 0;
                const registered = Number(event.registeredCount) || 0;

                return (
                  <tr key={event._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>{event.icon || "📌"}</span>
                        <strong>{event.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{event.category || "기타"}</span>
                    </td>
                    <td className="muted">{event.date}</td>
                    <td>{event.place}</td>
                    <td>
                      <select
                        className="status-select"
                        value={event.status || "모집중"}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)}
                      >
                        <option value="모집중">모집중</option>
                        <option value="진행중">진행중</option>
                        <option value="마감">마감</option>
                        <option value="종료">종료</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-button link"
                        onClick={() => openRegistrationsModal(event)}
                        style={{ cursor: "pointer", fontWeight: 600 }}
                      >
                        👥 {registered}명 {capacity > 0 ? `/ ${capacity}명` : ""} [명단]
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <Link className="text-button" href={`/events/${event._id}`} target="_blank">
                          보기
                        </Link>
                        <Link className="text-button link" href={`/admin/events/${event._id}/edit`}>
                          수정
                        </Link>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => handleDeleteEvent(event)}
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

      {/* 참가 신청자 명단 모달 */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{selectedEvent.icon} {selectedEvent.name} 참가 신청자</h2>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  현재 신청 인원: <strong>{registrations.length}명</strong>
                  {selectedEvent.capacity ? ` / 정원 ${selectedEvent.capacity}명` : ""}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>
                ✕
              </button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto", margin: "16px 0" }}>
              {loadingRegs ? (
                <p style={{ textAlign: "center", padding: "20px" }}>명단을 불러오는 중입니다...</p>
              ) : registrations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px" }}>
                  <p className="muted">아직 참가 신청한 학생이 없습니다.</p>
                </div>
              ) : (
                <table className="admin-table" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr style={{ height: "40px" }}>
                      <th>이름</th>
                      <th>학번/학급</th>
                      <th>연락처</th>
                      <th>비고</th>
                      <th style={{ textAlign: "right" }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => {
                      const isEditing = editingRegId === reg._id;

                      if (isEditing) {
                        return (
                          <tr key={reg._id} style={{ height: "55px", background: "rgba(41, 150, 255, 0.08)" }}>
                            <td>
                              <input
                                style={{ height: "34px", padding: "0 8px", fontSize: "13px", width: "90px" }}
                                value={editRegForm.name}
                                onChange={(e) =>
                                  setEditRegForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="이름"
                              />
                            </td>
                            <td>
                              <input
                                style={{ height: "34px", padding: "0 8px", fontSize: "13px", width: "120px" }}
                                value={editRegForm.studentId}
                                onChange={(e) =>
                                  setEditRegForm((prev) => ({ ...prev, studentId: e.target.value }))
                                }
                                placeholder="학번/학급"
                              />
                            </td>
                            <td>
                              <input
                                style={{ height: "34px", padding: "0 8px", fontSize: "13px", width: "120px" }}
                                value={editRegForm.contact}
                                onChange={(e) =>
                                  setEditRegForm((prev) => ({ ...prev, contact: e.target.value }))
                                }
                                placeholder="연락처"
                              />
                            </td>
                            <td>
                              <input
                                style={{ height: "34px", padding: "0 8px", fontSize: "13px", width: "140px" }}
                                value={editRegForm.note}
                                onChange={(e) =>
                                  setEditRegForm((prev) => ({ ...prev, note: e.target.value }))
                                }
                                placeholder="비고/메모"
                              />
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  className="text-button link"
                                  onClick={() => handleSaveRegistration(reg._id)}
                                  disabled={savingReg}
                                  style={{ fontWeight: 600, color: "#2ed573" }}
                                >
                                  {savingReg ? "저장중" : "저장"}
                                </button>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() => setEditingRegId(null)}
                                  disabled={savingReg}
                                >
                                  취소
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={reg._id} style={{ height: "50px" }}>
                          <td><strong>{reg.name}</strong></td>
                          <td>{reg.studentId || "-"}</td>
                          <td className="muted">{reg.contact || "-"}</td>
                          <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {reg.note || "-"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button
                                type="button"
                                className="text-button link"
                                onClick={() => startEditReg(reg)}
                                style={{ cursor: "pointer" }}
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className="text-button danger"
                                onClick={() => handleDeleteRegistration(reg._id)}
                                style={{ cursor: "pointer" }}
                              >
                                취소
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

            <div className="modal-footer">
              <button
                type="button"
                className="button primary"
                onClick={() => setSelectedEvent(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
