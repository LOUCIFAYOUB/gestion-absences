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
        borderRadius: "6px",
        opacity: 0.9,
        color: "#0f172a",
        border: "none",
        fontWeight: "600",
        fontSize: "0.8rem",
      },
    };
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div style={{ color: '#9ba4a9' }}>Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(168, 200, 47, 0.2)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #a8c82f 0%, #8fb526 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>DG</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a8c82f', margin: 0 }}>Digital Garden</h1>
            </div>
          </div>
          <a href="/dashboard" style={{ color: '#a8c82f', textDecoration: 'none', fontSize: '0.9rem' }}>Retour au Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Calendrier des Absences</h2>
          <p style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>Vue mensuelle et hebdomadaire</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
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