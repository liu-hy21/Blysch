import { requireUser } from "@/lib/auth";
import { BottomNav } from "@/components/app/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="phone-shell mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden">
      <a href="#main" className="skip-link">
        跳到正文
      </a>
      <main id="main" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
