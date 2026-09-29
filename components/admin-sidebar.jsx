import Link from "next/link";

const items = [
  ["/admin", "대시보드"],
  ["/admin/events", "행사 관리"],
  ["/admin/competitions", "대회 관리"],
  ["/admin/matches", "경기 관리"],
  ["/admin/notices", "공지사항 관리"]
];

export default function AdminSidebar({ active }) {
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <Link href="/" style={{ color: "#f5f5fa", textDecoration: "none" }} title="메인 홈으로 이동">
          ◈ &nbsp;학교 행사관리
        </Link>
      </div>

      <nav className="side-nav">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className={active === href ? "active" : ""}>
            {label}
          </Link>
        ))}

        <div style={{ margin: "24px 0 12px", borderTop: "1px solid #1f1f26" }} />

        <Link
          href="/"
          className="side-home-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#2996ff",
            background: "rgba(41, 150, 255, 0.08)",
            border: "1px solid rgba(41, 150, 255, 0.25)",
            fontWeight: 600,
          }}
        >
          <span>🏠</span> 메인 홈으로
        </Link>
      </nav>
    </aside>
  );
}
