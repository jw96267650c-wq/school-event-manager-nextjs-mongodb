"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../../../components/admin-layout";

const SPORTS = ["농구", "축구", "피구", "배구", "배드민턴", "e스포츠", "학술/퀴즈", "기타"];
const STATUSES = ["진행예정", "진행중", "종료"];

export default function EditCompetitionPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadCompetition() {
      try {
        setLoading(true);
        const res = await fetch(`/api/competitions/${id}`);
        if (!res.ok) throw new Error("대회 정보를 불러오지 못했습니다.");
        const data = await res.json();
        setForm({
          name: data.name || "",
          sport: data.sport || "농구",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          status: data.status || "진행예정",
          teams: data.teams !== undefined ? data.teams : 12,
          games: data.games !== undefined ? data.games : 12,
          playedGames: data.playedGames !== undefined ? data.playedGames : 0,
          progress: data.progress !== undefined ? data.progress : 0,
          description: data.description || "",
        });
      } catch (err) {
        console.error(err);
        setError("대회 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCompetition();
    }
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // 진행 경기 수나 전체 경기 수 변경 시 진행률 자동 계산
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

      const res = await fetch(`/api/competitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "대회 수정 실패");
      }

      alert("대회 정보가 수정되었습니다.");
      router.push("/admin/competitions");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "대회 수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout active="/admin/competitions">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>대회 정보를 불러오는 중입니다...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="/admin/competitions">
      <div className="admin-title-row">
        <div>
          <Link href="/admin/competitions" className="back-link">
            ← 대회 관리로 돌아가기
          </Link>
          <h1 style={{ marginTop: "12px" }}>대회 정보 수정</h1>
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

        {/* 대회 설명 */}
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
            {submitting ? "저장 중..." : "수정 내용 저장"}
          </button>
          <Link href="/admin/competitions" className="button">
            취소
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
