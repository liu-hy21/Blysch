import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackBar({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <Link
        href="/me"
        transitionTypes={["nav-back"]}
        className="flex h-11 w-11 items-center justify-center"
        aria-label="返回"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </Link>
      <h1 className="text-2xl">{title}</h1>
    </div>
  );
}
