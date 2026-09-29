"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../../components/admin-layout";

const SPORTS = ["농구", "축구", "피구", "배구", "배드민턴", "e스포츠", "학술/퀴즈", "기타"];
const STATUSES = ["진행예정", "진행중", "종료"];

export default function NewCompetitionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sport: "농구",
    startDate: "",
    endDate: "",
    status: "진행예정",
    teams: 12,
    games: 12,
    playedGames: 0,
    progress: 0,
    description: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "playedGames" || name === "games") {
        const games = name === "games" ? Number(value) : Number(prev.games);
        const played = name === "playedGames" ? Number(value) : Number(prev.playedGames);
        if (games > 0) {
          updated.progress = Math.round((played / games) * 100);
        }
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("대회명을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        teams: Number(form.teams) || 0,
        games: Number(form.games) || 0,
        playedGames: Number(form.playedGames) || 0,
        progress: Number(form.progress) || 0,
      };

      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "등록 실패");
      }

      alert("새 대회가 등록되었습니다.");
      router.push("/admin/competitions");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "대회 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout active="/admin/competitions">
      <div className="admin-title-row">
        <div>
          <Link href="/admin/competitions" className="back-link">
            ← 대회 관리로 돌아가기
          </Link>
          <h1 style={{ marginTop: "12px" }}>새 대회 등록</h1>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: "14px" }}>
            교내 스포츠 토너먼트나 학술 경진 대회를 등록하세요.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(255,71,87,.15)",
              border: "1px solid rgba(255,71,87,.35)",
              borderRadius: "12px",
              color: "#ff4757",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* 대회명 */}
        <label>
          대회명 <span style={{ color: "#ff4757" }}>*</span>
          <input
            name="name"
            required
            placeholder="예: 2026학년도 교내 가을 농구대회"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        {/* 2열: 종목 & 진행 상태 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            종목
            <select name="sport" value={form.sport} onChange={handleChange}>
              {SPORTS.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </label>

          <label>
            진행 상태
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 2열: 시작일 & 종료일 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            시작일
            <input
              name="startDate"
              placeholder="예: 2026.09.05"
              value={form.startDate}
              onChange={handleChange}
            />
          </label>

          <label>
            종료일
            <input
              name="endDate"
              placeholder="예: 2026.09.10"
              value={form.endDate}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* 4열: 참가 팀 수, 전체 경기 수, 진행 경기 수, 진행률 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          <label>
            참가 팀 수
            <input
              type="number"
              name="teams"
              value={form.teams}
              onChange={handleChange}
              min={0}
            />
          </label>

          <label>
            전체 경기 수
            <input
              type="number"
              name="games"
              value={form.games}
              onChange={handleChange}
              min={0}
            />
          </label>

          <label>
            진행 경기 수
            <input
              type="number"
              name="playedGames"
              value={form.playedGames}
              onChange={handleChange}
              min={0}
            />
          </label>

          <label>
            진행률 (%)
            <input
              type="number"
              name="progress"
              value={form.progress}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </label>
        </div>

        {/* 설명 */}
        <label>
          대회 상세 설명 / 규칙
          <textarea
            name="description"
            rows={4}
            placeholder="대회 방식(토너먼트/풀리그), 경기 규칙, 상품 등을 입력하세요."
            value={form.description}
            onChange={handleChange}
          />
        </label>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "등록 중..." : "대회 등록"}
          </button>
          <Link href="/admin/competitions" className="button">
            취소
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
