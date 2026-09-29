import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">◈ &nbsp;학교 행사·대회 관리</Link>
      <nav className="top-nav">
        <Link href="/events">행사</Link>
        <Link href="/competition">대회</Link>
        <Link href="/schedule">경기 일정</Link>
        <Link href="/login">로그인</Link>
      </nav>
    </header>
  );
}
