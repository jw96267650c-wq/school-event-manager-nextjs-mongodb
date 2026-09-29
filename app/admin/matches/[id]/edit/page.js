"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../../../components/admin-layout";

const STATUSES = ["예정", "진행중", "종료", "연기", "취소"];

export default function EditMatchPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    competitionId: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    venue: "",
    status: "예정",
    homeScore: "",
    awayScore: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [matchRes, compRes] = await Promise.all([
          fetch(`/api/matches/${id}`),
          fetch("/api/competitions"),
        ]);

        if (!matchRes.ok) throw new Error("경기 정보를 불러오지 못했습니다.");
        const matchData = await matchRes.json();

        if (compRes.ok) {
          const compData = await compRes.json();
          setCompetitions(Array.isArray(compData) ? compData : compData.competitions || []);
        }

        setForm({
          competitionId: matchData.competitionId || "",
          homeTeam: matchData.homeTeam || matchData.home || "",
          awayTeam: matchData.awayTeam || matchData.away || "",
          date: matchData.date || "",
          time: matchData.time || "",
          venue: matchData.venue || matchData.place || "",
          status: matchData.status || "예정",
          homeScore:
            matchData.homeScore === null || matchData.homeScore === undefined
              ? ""
              : String(matchData.homeScore),
          awayScore:
            matchData.awayScore === null || matchData.awayScore === undefined
              ? ""
              : String(matchData.awayScore),
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "데이터 로드 오류");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.competitionId) {
      setError("대회를 선택해주세요.");
      return;
    }
    if (!form.homeTeam.trim() || !form.awayTeam.trim()) {
      setError("홈팀과 원정팀을 모두 입력해주세요.");
      return;
    }
    if (form.homeTeam.trim() === form.awayTeam.trim()) {
      setError("홈팀과 원정팀은 서로 달라야 합니다.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: form.competitionId,
          homeTeam: form.homeTeam.trim(),
          awayTeam: form.awayTeam.trim(),
          date: form.date,
          time: form.time,
          venue: form.venue.trim(),
          status: form.status,
          homeScore: form.homeScore === "" ? null : Number(form.homeScore),
          awayScore: form.awayScore === "" ? null : Number(form.awayScore),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "경기 수정 실패");
      }

      alert("경기 일정이 수정되었습니다.");
      router.push("/admin/matches");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "경기 수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout active="/admin/matches">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>경기 정보를 불러오는 중입니다...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="/admin/matches">
      <div className="admin-title-row">
        <div>
          <Link href="/admin/matches" className="back-link">
            ← 경기 관리로 돌아가기
          </Link>
          <h1 style={{ marginTop: "12px" }}>경기 일정 및 결과 수정</h1>
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

        {/* 대회 선택 */}
        <label>
          소속 대회 선택 <span style={{ color: "#ff4757" }}>*</span>
          <select
            name="competitionId"
            value={form.competitionId}
            onChange={handleChange}
            required
          >
            <option value="">대회를 선택해주세요</option>
            {competitions.map((comp) => (
              <option key={comp._id} value={comp._id}>
                {comp.name} {comp.sport ? `(${comp.sport})` : ""}
              </option>
            ))}
          </select>
        </label>

        {/* 2열: 홈팀 & 원정팀 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            홈팀 명칭 <span style={{ color: "#ff4757" }}>*</span>
            <input
              name="homeTeam"
              required
              placeholder="예: 2학년 1반 (블루윙즈)"
              value={form.homeTeam}
              onChange={handleChange}
            />
          </label>

          <label>
            원정팀 명칭 <span style={{ color: "#ff4757" }}>*</span>
            <input
              name="awayTeam"
              required
              placeholder="예: 2학년 3반 (레드타이거즈)"
              value={form.awayTeam}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* 2열: 경기 날짜 & 시간 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            경기 날짜
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <label>
            경기 시작 시간
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* 2열: 경기 장소 & 상태 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            경기 장소
            <input
              name="venue"
              placeholder="예: 실내체육관 A코트, 운동장 1구장"
              value={form.venue}
              onChange={handleChange}
            />
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

        {/* 2열: 홈팀 점수 & 원정팀 점수 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            홈팀 득점 ({form.homeTeam || "홈팀"})
            <input
              type="number"
              name="homeScore"
              placeholder="경기 전이면 비워두세요"
              value={form.homeScore}
              onChange={handleChange}
              min={0}
            />
          </label>

          <label>
            원정팀 득점 ({form.awayTeam || "원정팀"})
            <input
              type="number"
              name="awayScore"
              placeholder="경기 전이면 비워두세요"
              value={form.awayScore}
              onChange={handleChange}
              min={0}
            />
          </label>
        </div>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "저장 중..." : "수정 내용 저장"}
          </button>
          <Link href="/admin/matches" className="button">
            취소
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}