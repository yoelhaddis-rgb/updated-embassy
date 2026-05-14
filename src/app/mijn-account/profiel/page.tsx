import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function ProfielPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      firstName: true, lastName: true, email: true,
      phone: true, dateOfBirth: true, eritreanIdNumber: true,
      nationality: true, address: true,
    },
  });

  if (!user) redirect("/inloggen");

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/mijn-account" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Mijn profiel</h1>
            <p className="text-white/40 text-sm">Persoonlijke gegevens bewerken</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-2xl mx-auto px-8 py-10">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
