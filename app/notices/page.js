import PageShell from "../../components/page-shell";
import { getNotices } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices = await getNotices();

  return (
    <PageShell>
      <main className="page">
        <h1 className="page-title">공지사항</h1>
        <p className="page-description">행사와 대회에 관한 새로운 소식을 확인하세요.</p>
        
        {notices.length === 0 ? (
          <div className="card" style={{ padding: "60px 20px", textAlign: "center", marginTop: "36px", borderRadius: "16px" }}>
            <p className="muted" style={{ margin: 0 }}>등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="card notice-box" style={{ height: "auto" }}>
            {notices.map((notice) => (
              <div className="notice-row" key={notice._id}>
                <span>{notice.title}</span>
                <span className="muted">{notice.date}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </PageShell>
  );
}
