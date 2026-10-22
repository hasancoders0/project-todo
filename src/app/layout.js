
import "./globals.css";

export const metadata = {
  title: "Project Todo",
  description: "Internal project and team task management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
