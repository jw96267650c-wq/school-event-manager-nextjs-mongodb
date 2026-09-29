"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin-layout";

const CATEGORIES = ["전체", "안내", "대회", "행사", "일정", "일반"];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 등록/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null); // null이면 신규 등록, 객체면 수정
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "안내",
    important: false,
    date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("전체");

  useEffect(() => {
    loadNotices();
  }, []);

  async function loadNotices() {
    try {
      setLoading(true);
      const res = await fetch("/api/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (err) {
      console.error("공지사항 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  // 모달 열기 (신규)
  function handleOpenNew() {
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, ".");
    setEditingNotice(null);
    setForm({
      title: "",
      content: "",
      category: "안내",
      important: false,
      date: today,
    });
    setIsModalOpen(true);
  }

  // 모달 열기 (수정)
  function handleOpenEdit(notice) {
    setEditingNotice(notice);
    setForm({
      title: notice.title || "",
      content: notice.content || "",
      category: notice.category || "안내",
      important: Boolean(notice.important),
      date: notice.date || "",
    });
    setIsModalOpen(true);
  }

  // 등록 또는 수정 제출
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("공지사항 제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingNotice);
      const url = isEdit ? `/api/notices/${editingNotice._id}` : "/api/notices";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(isEdit ? "공지사항이 수정되었습니다." : "공지사항이 등록되었습니다.");
        setIsModalOpen(false);
        await loadNotices();
      } else {
        const data = await res.json();
        alert(data.error || "처리 실패");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // 공지사항 삭제
  async function handleDelete(notice) {
    if (!window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/notices/${notice._id}`, { method: "DELETE" });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n._id !== notice._id));
        alert("공지사항이 삭제되었습니다.");
      } else {
        alert("공지사항 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  const filteredNotices = notices.filter(
    (n) => filterCategory === "전체" || (n.category || "일반") === filterCategory
  );

  const totalNotices = notices.length;
  const importantCount = notices.filter((n) => n.important).length;

  return (
    <AdminLayout active="/admin/notices">
      <div className="admin-title-row">
        <div>
          <h1>공지사항 관리</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            교내 행사와 대회 소식을 등록하고 공지사항을 수정 및 관리하세요.
          </p>
        </div>
        <button className="button primary" onClick={handleOpenNew} type="button">
          ＋ 새 공지 등록
        </button>
      </div>

      {/* 요약 통계 카드 */}
      <div className="stats-row" style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div className="card stat-card">
          <b>{totalNotices}</b>
          <span className="muted">전체 공지사항</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#ff4757" }}>{importantCount}</b>
          <span className="muted">주요/긴급 공지</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2996ff" }}>{totalNotices - importantCount}</b>
          <span className="muted">일반 공지</span>
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`pill ${filterCategory === cat ? "active" : ""}`}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: filterCategory === cat ? "#2996ff" : "#121216",
              border: "1px solid #24242e",
              color: filterCategory === cat ? "#fff" : "#85858f",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 공지 목록 테이블 */}
      <div className="card admin-list">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>공지사항 목록을 불러오는 중입니다...</p>
        ) : filteredNotices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>등록된 공지사항이 없습니다.</h3>
            <p className="muted">새로운 공지사항을 등록해보세요.</p>
            <button
              className="button primary"
              onClick={handleOpenNew}
              style={{ marginTop: "12px" }}
              type="button"
            >
              공지사항 작성하기
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>상태</th>
                <th style={{ width: "90px" }}>분류</th>
                <th>제목</th>
                <th style={{ width: "120px" }}>등록일</th>
                <th style={{ width: "160px", textAlign: "right" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((notice) => (
                <tr key={notice._id}>
                  <td>
                    {notice.important ? (
                      <span className="status-badge closed" style={{ fontSize: "11px" }}>
                        중요
                      </span>
                    ) : (
                      <span className="status-badge ended" style={{ fontSize: "11px" }}>
                        일반
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="category-tag">{notice.category || "일반"}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "15px" }}>{notice.title}</strong>
                    {notice.content && (
                      <p
                        className="muted"
                        style={{
                          margin: "4px 0 0",
                          fontSize: "12px",
                          maxWidth: "500px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notice.content}
                      </p>
                    )}
                  </td>
                  <td className="muted">{notice.date || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="text-button link"
                        onClick={() => handleOpenEdit(notice)}
                        style={{ cursor: "pointer", fontWeight: 600 }}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="text-button danger"
                        onClick={() => handleDelete(notice)}
                        style={{ cursor: "pointer" }}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 등록 / 수정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingNotice ? "공지사항 수정" : "새 공지사항 등록"}</h2>
              <button
                className="modal-close-btn"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <label>
                  공지사항 제목 <span style={{ color: "#ff4757" }}>*</span>
                  <input
                    name="title"
                    required
                    placeholder="예: 2026학년도 교내 체육대회 본선 대진표 공지"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label>
                    분류 (카테고리)
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      style={{
                        height: "44px",
                        background: "#0b0b0e",
                        border: "1px solid #2e2e38",
                        borderRadius: "12px",
                        color: "#f5f5fa",
                        padding: "0 12px",
                      }}
                    >
                      {CATEGORIES.filter((c) => c !== "전체").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    표시 날짜
                    <input
                      name="date"
                      placeholder="예: 26.10.15"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </label>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", margin: "4px 0" }}>
                  <input
                    type="checkbox"
                    checked={form.important}
                    onChange={(e) => setForm({ ...form, important: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: form.important ? "#ff4757" : "#85858f" }}>
                    ⭐ 중요 / 긴급 공지로 상단 강조 표시
                  </span>
                </label>

                <label>
                  상세 내용
                  <textarea
                    rows={6}
                    placeholder="학생 및 교직원에게 안내할 상세 공지사항을 작성하세요."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={submitting}
                >
                  {submitting ? "저장 중..." : editingNotice ? "수정 내용 저장" : "공지사항 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
