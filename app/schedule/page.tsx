"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  momentLocalizer,
  type SlotInfo,
  type View,
} from "react-big-calendar";
import moment from "moment";
// @ts-ignore: Implicit side-effect import of CSS without type declarations
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lab, Room, Booking } from "@/lib/types";
import { BookingModal } from "@/components/booking-modal";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

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
  const [labs, setLabs] = useState<Lab[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [view, setView] = useState<View>("week");
  const [loading, setLoading] = useState(false);

  const { user, token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLabsAndBookings();
    }
  }, [user]);

  if (authLoading) {
    return null;
  }

  const fetchLabsAndBookings = async () => {
    try {
      setLoading(true);
      const [laboratories, bookingsData] = await Promise.all([
        apiService.getLabs(token as string),
        apiService.getBookings(token as string),
      ]);

      setLabs(laboratories);
      setBookings(bookingsData);

      if (laboratories.length > 0) {
        setSelectedLab(laboratories[0]);
        if (laboratories[0].rooms && laboratories[0].rooms.length > 0) {
          setSelectedRoom(laboratories[0].rooms[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    if (!selectedLab || !selectedRoom) {
      toast("Selecione um laboratório e sala", {
        description:
          "Você precisa selecionar um laboratório e uma sala antes de agendar.",
      });
      return;
    }

    if (slotInfo.start < new Date()) {
      toast.error("Não é possível agendar para horários passados.");
      return;
    }

    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (bookingData: Booking) => {
    try {
      const { id, ...bookingToCreate } = bookingData;
      const newBooking = await apiService.createBooking(
        token as string,
        bookingToCreate
      );

      setBookings((prev) => [...prev, newBooking]);

      toast.success("Agendamento realizado", {
        description: "A sala foi reservada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao realizar agendamento.");
      throw error;
    }
  };

  const filteredEvents = bookings
    .filter(
      (booking) =>
        booking.labId === selectedLab?.id && booking.roomId === selectedRoom?.id
    )
    .map((booking) => {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);

      console.log("Processando booking:", {
        id: booking.id,
        title: `${booking.purpose} - ${booking.user.name}`,
        start: start.toString(),
        end: end.toString(),
        isValidStart: !isNaN(start.getTime()),
        isValidEnd: !isNaN(end.getTime()),
      });

      return {
        id: booking.id,
        title: `${booking.purpose} - ${booking.user.name}`,
        start: start,
        end: end,
        allDay: false,
        resource: booking,
      };
    });

  const handleLabChange = (labId: string) => {
    const lab = labs.find((l) => l.id === Number(labId));
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
    const room = selectedLab?.rooms?.find((r) => r.id === Number(roomId));
    if (room) {
      setSelectedRoom(room);
    }
  };

  const refreshBookings = async () => {
    try {
      const bookingsData = await apiService.getBookings(token as string);
      setBookings(bookingsData);
      toast.success("Agendamentos atualizados");
    } catch (error) {
      console.error("Erro ao atualizar agendamentos:", error);
      toast.error("Erro ao atualizar agendamentos.");
    }
  };

  const eventStyleGetter = () => {
    return {
      style: {
        background: "linear-gradient(135deg, #3b82f6, #1e40af)",
        color: "#fff",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontSize: "13px",
        fontWeight: 600,
      },
    };
  };

  const slotPropGetter = (date: Date) => {
    const now = new Date();
    if (date < now) {
      return {
        className: "rbc-past-slot",
        style: {
          backgroundColor: "hsl(var(--muted))",
          opacity: 0.6,
        },
      };
    }
    return {};
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-lg">
          Por favor, faça login para acessar o sistema.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-foreground">Carregando agendamentos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Agendamento de Salas
            </h2>
            <p className="text-muted-foreground mt-1">
              Visualize e reserve horários disponíveis
            </p>
          </div>
          <button
            onClick={refreshBookings}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Atualizar
          </button>
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
              {selectedLab &&
                (!selectedLab.rooms || selectedLab.rooms.length === 0) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Nenhuma sala cadastrada neste laboratório
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            {!selectedLab || !selectedRoom ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground text-lg">
                  Selecione um laboratório e uma sala para ver os agendamentos
                </p>
              </div>
            ) : (
              <div className="calendar-container">
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
                  min={new Date(new Date().setHours(7, 0, 0, 0))}
                  max={new Date(new Date().setHours(22, 0, 0, 0))}
                  eventPropGetter={eventStyleGetter}
                  slotPropGetter={slotPropGetter}
                  popup
                  showMultiDayTimes
                  defaultDate={new Date()}
                  formats={{
                    timeGutterFormat: "HH:mm",
                    eventTimeRangeFormat: ({ start, end }) =>
                      `${moment(start).format("HH:mm")} - ${moment(end).format(
                        "HH:mm"
                      )}`,
                    dayFormat: "DD/MM",
                    dayRangeHeaderFormat: ({ start, end }) =>
                      `${moment(start).format("DD/MM")} - ${moment(end).format(
                        "DD/MM"
                      )}`,
                  }}
                  style={{
                    height: "100%",
                  }}
                />
              </div>
            )}
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
        user={user}
        existingBookings={bookings.filter(
          (booking) =>
            booking.labId === selectedLab?.id &&
            booking.roomId === selectedRoom?.id
        )}
      />
    </div>
  );
}
