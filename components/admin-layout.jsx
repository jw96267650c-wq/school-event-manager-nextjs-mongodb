import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({ active, children }) {
  return (
    <div className="admin">
      <AdminSidebar active={active} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
