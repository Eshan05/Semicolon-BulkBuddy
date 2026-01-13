export const metadata = {
  title: "BulkBuddy | Authentication",
  description: "User authentication for BulkBuddy - B2B group buying platform",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      {children}
    </main>
  );
}
