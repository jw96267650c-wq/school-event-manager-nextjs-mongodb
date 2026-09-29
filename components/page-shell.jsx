import SiteHeader from "./site-header";

export default function PageShell({ children }) {
  return (
    <div className="site">
      <SiteHeader />
      {children}
    </div>
  );
}
