import { requireUser } from "@/lib/auth";
import { ProfileClient } from "./profile-client";
import { PageStack } from "@/components/app/page-stack";

export default async function ProfilePage() {
  const user = await requireUser();
  const couple = user.memberships[0]?.couple;
  return (
    <PageStack>
    <ProfileClient
      nickname={user.nickname}
      avatar={user.avatar}
      startDate={couple?.startDate.toISOString().slice(0, 10) ?? ""}
    />
    </PageStack>
  );
}
