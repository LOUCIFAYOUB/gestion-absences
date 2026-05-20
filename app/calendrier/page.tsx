"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { fr: fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Absence {
  id: number;
  employee: { first_name: string; last_name: string };
  type: { name: string; color: string };
  start_date: string;
  end_date: string;
  reason: string | null;
  is_half_day: boolean;
}

export default function CalendrierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchAbsences();
    }
  }, [status, router]);

  async function fetchAbsences() {
    try {
      const res = await fetch("/api/absences");
      const absences: Absence[] = await res.json();

      const calendarEvents = absences.map((abs) => ({
        id: abs.id,
        title: `${abs.employee.first_name} ${abs.employee.last_name} - ${abs.type.name}${abs.is_half_day ? " (1/2j)" : ""}`,
        start: new Date(abs.start_date),
        end: new Date(abs.end_date),
        resource: abs,
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  function eventStyleGetter(event: any) {
    const color = event.resource?.type?.color || "#a8c82f";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "4px",
        opacity: 0.9,
        color: "#1a1a2e",
        border: "none",
        fontWeight: "bold",
      },
    };
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-[#9ba4a9] text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-[#2a2a4a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#a8c82f]">Calendrier des Absences</h1>
            <p className="text-[#9ba4a9] text-sm mt-1">Vue mensuelle et hebdomadaire</p>
          </div>
          <a href="/dashboard" className="text-[#a8c82f] hover:text-[#8fb526] transition">
            Retour au Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
            culture="fr"
            messages={{
              today: "Aujourd'hui",
              previous: "Precedent",
              next: "Suivant",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Liste",
              date: "Date",
              time: "Heure",
              event: "Evenement",
              noEventsInRange: "Aucune absence dans cette periode",
            }}
          />
        </div>
      </main>
    </div>
  );
}