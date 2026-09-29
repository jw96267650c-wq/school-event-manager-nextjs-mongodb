"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin-layout";

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitions();
  }, []);

  async function loadCompetitions() {
    try {
      setLoading(true);
      const res = await fetch("/api/competitions");
      if (res.ok) {
        const data = await res.json();
        setCompetitions(Array.isArray(data) ? data : data.competitions || []);
      }
    } catch (err) {
      console.error("대회 목록 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  // 대회 상태 빠른 변경
  async function handleStatusChange(comp, newStatus) {
    const id = comp._id;
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: comp.name,
          sport: comp.sport,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setCompetitions((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  }

  // 진행률(퍼센트) 빠른 변경
  async function handleProgressChange(comp) {
    const currentProgress = comp.progress !== undefined ? comp.progress : 0;
    const input = window.prompt(`"${comp.name}" 대회의 진행률(%)을 입력하세요 (0 ~ 100):`, String(currentProgress));
    if (input === null) return;

    const newProgress = Number(input);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      alert("0부터 100 사이의 숫자를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/competitions/${comp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: comp.name,
          progress: newProgress,
        }),
      });

      if (res.ok) {
        setCompetitions((prev) =>
          prev.map((c) => (c._id === comp._id ? { ...c, progress: newProgress } : c))
        );
        alert("진행률이 변경되었습니다.");
      } else {
        alert("진행률 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("진행률 수정 중 오류가 발생했습니다.");
    }
  }

  // 대회 삭제
  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `"${name}" 대회를 삭제하시겠습니까?\n\n삭제하면 해당 대회의 경기 일정과 결과도 함께 삭제됩니다.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCompetitions((prev) => prev.filter((c) => c._id !== id));
        alert("대회가 삭제되었습니다.");
      } else {
        const data = await res.json();
        alert(data.message || "대회 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  const total = competitions.length;
  const ongoing = competitions.filter((c) => c.status === "진행중").length;
  const upcoming = competitions.filter((c) => c.status === "진행예정" || !c.status).length;

  return (
    <AdminLayout active="/admin/competitions">
      <div className="admin-title-row">
        <div>
          <h1>대회 관리</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            교내 스포츠 및 학술 대회를 등록하고 진행 상황과 경기 일정을 관리하세요.
          </p>
        </div>
        <Link className="button primary" href="/admin/competitions/new">
          ＋ 새 대회 등록
        </Link>
      </div>

      {/* 요약 통계 카드 */}
      <div className="stats-row" style={{ marginTop: "24px", marginBottom: "24px" }}>
        <div className="card stat-card">
          <b>{total}</b>
          <span className="muted">총 등록 대회</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2ed573" }}>{ongoing}</b>
          <span className="muted">진행 중 대회</span>
        </div>
        <div className="card stat-card">
          <b style={{ color: "#2996ff" }}>{upcoming}</b>
          <span className="muted">진행 예정 대회</span>
        </div>
      </div>

      {/* 대회 목록 테이블 */}
      <div className="card admin-list">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>대회 목록을 불러오는 중입니다...</p>
        ) : competitions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>등록된 대회가 없습니다.</h3>
            <p className="muted">새로운 대회를 등록해보세요.</p>
            <Link
              className="button primary"
              href="/admin/competitions/new"
              style={{ marginTop: "12px" }}
            >
              대회 등록하기
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>대회명</th>
                <th>종목</th>
                <th>대회 기간</th>
                <th>진행 상태</th>
                <th>진행률</th>
                <th style={{ textAlign: "right" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((comp) => {
                const id = comp._id;
                const progress = comp.progress !== undefined ? comp.progress : 0;

                return (
                  <tr key={id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>🏆</span>
                        <strong>{comp.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{comp.sport || "기타"}</span>
                    </td>
                    <td className="muted">
                      {comp.startDate || "-"} ~ {comp.endDate || "-"}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={comp.status || "진행예정"}
                        onChange={(e) => handleStatusChange(comp, e.target.value)}
                      >
                        <option value="진행예정">진행예정</option>
                        <option value="진행중">진행중</option>
                        <option value="종료">종료</option>
                      </select>
                    </td>
                    <td>
                      <div
                        onClick={() => handleProgressChange(comp)}
                        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                        title="클릭하여 진행률(%) 수정"
                      >
                        <div
                          style={{
                            width: "70px",
                            height: "6px",
                            borderRadius: "4px",
                            background: "#1b1b20",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, progress))}%`,
                              height: "100%",
                              background: "#2996ff",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "12px", color: "#85858f" }}>{progress}% ✎</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                        <Link
                          className="text-button link"
                          href={`/admin/competitions/${id}/edit`}
                          style={{ fontWeight: 600 }}
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => handleDelete(id, comp.name)}
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