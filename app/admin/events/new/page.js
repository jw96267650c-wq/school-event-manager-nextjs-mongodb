"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../../../../components/admin-layout";

const EMOJI_PRESETS = ["🏀", "⚽", "🎤", "🎨", "🎵", "📚", "🏆", "🎪", "🔬", "♟️", "🎭", "💡", "🎬", "🚀", "📌"];
const CATEGORIES = ["체육", "축제", "동아리", "학술", "전시", "기타"];
const STATUSES = ["모집중", "진행중", "마감", "종료"];

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    date: "",
    place: "",
    category: "체육",
    status: "모집중",
    target: "전교생",
    capacity: 50,
    icon: "🏀",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.date.trim() || !form.place.trim()) {
      setError("행사명, 일시, 장소를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "등록 실패");
      }

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "행사 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout active="/admin/events">
      <div className="admin-title-row">
        <div>
          <Link href="/admin/events" className="back-link">← 행사 관리로 돌아가기</Link>
          <h1 style={{ marginTop: "12px" }}>새 행사 등록</h1>
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

        {/* 대표 아이콘 / 이모지 선택 */}
        <label>
          대표 아이콘 선택
          <div className="emoji-picker-row">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-option ${form.icon === emoji ? "selected" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, icon: emoji }))}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
            <span className="muted" style={{ fontSize: "13px" }}>직접 입력:</span>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              style={{ width: "80px", textAlign: "center", fontSize: "18px" }}
              maxLength={2}
            />
          </div>
        </label>

        {/* 행사명 */}
        <label>
          행사명 <span style={{ color: "#ff4757" }}>*</span>
          <input
            name="name"
            required
            placeholder="예: 2026학년도 교내 가을 축제"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        {/* 2열: 카테고리 & 진행 상태 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            분류 (카테고리)
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label>
            모집 / 진행 상태
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </label>
        </div>

        {/* 2열: 행사 일시 & 장소 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            행사 일시 / 기간 <span style={{ color: "#ff4757" }}>*</span>
            <input
              name="date"
              required
              placeholder="예: 2026.10.15 ~ 10.16 또는 2026.10.20 14:00"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <label>
            진행 장소 <span style={{ color: "#ff4757" }}>*</span>
            <input
              name="place"
              required
              placeholder="예: 학교 대강당, 운동장, 체육관"
              value={form.place}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* 2열: 참가 대상 & 모집 정원 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <label>
            참가 대상
            <input
              name="target"
              placeholder="예: 전교생, 1~2학년, 동아리 부원"
              value={form.target}
              onChange={handleChange}
            />
          </label>

          <label>
            모집 정원 (명)
            <input
              type="number"
              name="capacity"
              placeholder="0 (0이면 정원 제한 없음)"
              value={form.capacity}
              onChange={handleChange}
              min={0}
            />
          </label>
        </div>

        {/* 행사 상세 소개 */}
        <label>
          행사 상세 소개
          <textarea
            name="description"
            rows={5}
            placeholder="행사의 목적, 일정 세부사항, 준비물 또는 참가자 유의사항을 입력하세요."
            value={form.description}
            onChange={handleChange}
          />
        </label>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "등록 중..." : "행사 등록 완료"}
          </button>
          <Link href="/admin/events" className="button">
            취소
          </Link>
        </div>
      </form>
    </AdminLayout>
  );
}
