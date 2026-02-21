import { auth } from "@/auth";
import { dbPool } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const handlePattern = /^[a-zA-Z0-9_\-.]{3,24}$/;

export default async function AuthFinalizePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/landing");
  }

  const cookieStore = await cookies();
  const handle = cookieStore.get("cfetch_handle_lock")?.value?.trim();

  if (handle && handlePattern.test(handle)) {
    await dbPool.query(
      `UPDATE users
       SET name = $1
       WHERE email = $2`,
      [handle, session.user.email],
    );
  }

  redirect("/duels");
}
