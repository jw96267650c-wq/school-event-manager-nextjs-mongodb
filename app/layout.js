import "./globals.css";

export const metadata = {
  title: "학교 행사·대회 관리",
  description: "학교 행사와 대회를 한눈에 관리하는 서비스"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
