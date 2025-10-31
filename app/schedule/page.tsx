"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
// import "moment/locale/pt-br"
// import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Laboratory, Room, Booking } from "@/lib/types";
import { BookingModal } from "@/components/booking-modal";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Não há agendamentos neste período.",
  showMore: (total: number) => `+ ${total} mais`,
};

export default function SchedulePage() {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [view, setView] = useState<View>("week");

  const { user } = useAuth();

  useEffect(() => {
    const storedLabs = localStorage.getItem("laboratories");
    const storedBookings = localStorage.getItem("bookings");

    if (storedLabs) {
      const parsedLabs = JSON.parse(storedLabs);
      setLabs(parsedLabs);
      if (parsedLabs.length > 0) {
        setSelectedLab(parsedLabs[0]);
        if (parsedLabs[0].rooms && parsedLabs[0].rooms.length > 0) {
          setSelectedRoom(parsedLabs[0].rooms[0]);
        }
      }
    }

    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!selectedLab || !selectedRoom) {
      toast("Selecione um laboratório e sala", {
        description:
          "Você precisa selecionar um laboratório e uma sala antes de agendar.",
      });
      return;
    }

    setSelectedSlot({ start, end });
    setIsModalOpen(true);
  };

  const handleSaveBooking = (booking: Booking) => {
    const updatedBookings = [...bookings, booking];
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setBookings(updatedBookings);

    toast("Agendamento realizado", {
      description: "A sala foi reservada com sucesso.",
    });
  };

  const filteredEvents = bookings
    .filter(
      (booking) =>
        booking.laboratoryId === selectedLab?.id &&
        booking.roomId === selectedRoom?.id
    )
    .map((booking) => ({
      id: booking.id,
      title: `${booking.purpose} - ${booking.responsible}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: booking,
    }));

  const handleLabChange = (labId: string) => {
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      setSelectedLab(lab);
      if (lab.rooms && lab.rooms.length > 0) {
        setSelectedRoom(lab.rooms[0]);
      } else {
        setSelectedRoom(null);
      }
    }
  };

  const handleRoomChange = (roomId: string) => {
    const room = selectedLab?.rooms?.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-lg">
          Por favor, faça login para acessar o sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Agendamento de Salas
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualize e reserve horários disponíveis
          </p>
        </div>

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">
                Selecionar Laboratório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                value={selectedLab?.id || ""}
                onChange={(e) => handleLabChange(e.target.value)}
              >
                <option value="">Selecione um laboratório</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} - {lab.location}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Selecionar Sala</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                value={selectedRoom?.id || ""}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={
                  !selectedLab ||
                  !selectedLab.rooms ||
                  selectedLab.rooms.length === 0
                }
              >
                <option value="">Selecione uma sala</option>
                {selectedLab?.rooms?.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Capacidade: {room.capacity})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="calendar-container" style={{ height: "600px" }}>
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                selectable
                onSelectSlot={handleSelectSlot}
                view={view}
                onView={setView}
                defaultView="week"
                step={30}
                timeslots={2}
                min={new Date(2024, 0, 1, 7, 0)}
                max={new Date(2024, 0, 1, 22, 0)}
                eventPropGetter={() => ({
                  style: {
                    backgroundColor: "hsl(var(--chart-1))",
                    borderColor: "hsl(var(--chart-1))",
                    color: "white",
                  },
                })}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        onSave={handleSaveBooking}
        laboratory={selectedLab}
        room={selectedRoom}
        slot={selectedSlot}
        existingBookings={bookings}
      />
    </div>
  );
}
