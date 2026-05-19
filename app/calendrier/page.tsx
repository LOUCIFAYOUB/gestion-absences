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
        title: `${abs.employee.first_name} ${abs.employee.last_name} - ${abs.type.name}${abs.is_half_day ? " (½j)" : ""}`,
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
    const color = event.resource?.type?.color || "#3B82F6";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
      },
    };
  }

  if (status === "loading" || loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📅 Calendrier des Absences</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">← Retour au Dashboard</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white p-6 rounded-xl shadow">
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
              previous: "Précédent",
              next: "Suivant",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Liste",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucune absence dans cette période",
            }}
          />
        </div>
      </main>
    </div>
  );
}