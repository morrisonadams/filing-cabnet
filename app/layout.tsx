export const metadata = {
  title: "Digital Filing Cabinet",
  description: "Barebones mobile-friendly scanner + organizer",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="max-w-screen-sm mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}