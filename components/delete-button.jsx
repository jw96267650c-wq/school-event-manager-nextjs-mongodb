'use client';

export default function DeleteButton({ endpoint, id }) {
  async function remove() {
    if (!confirm("정말 삭제할까요?")) return;
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
    else alert("삭제하지 못했습니다.");
  }
  return <button className="text-button danger" onClick={remove}>삭제</button>;
}
