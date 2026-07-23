import "./globals.css";

export const metadata = {
  title: "TaskForge — Next-Gen Task Management Platform",
  description: "Production-grade, high-performance task management web application powered by Next.js and Spring Boot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-glow-orb-1" />
        <div className="bg-glow-orb-2" />
        {children}
      </body>
    </html>
  );
}
