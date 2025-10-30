"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Laboratory, Room, Booking } from "@/lib/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  laboratory: Laboratory | null;
  room: Room | null;
  slot: { start: Date; end: Date } | null;
  existingBookings: Booking[];
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  laboratory,
  room,
  slot,
  existingBookings,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    responsible: "",
    purpose: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        responsible: "",
        purpose: "",
      });
    }
  }, [isOpen]);

  const checkConflict = (start: Date, end: Date): boolean => {
    if (!laboratory || !room) return false;

    return existingBookings.some((booking) => {
      if (
        booking.laboratoryId !== laboratory.id ||
        booking.roomId !== room.id
      ) {
        return false;
      }

      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!laboratory || !room || !slot) return;

    if (checkConflict(slot.start, slot.end)) {
      toast("Conflito de Agendamento", {
        description:
          "Já existe uma reserva neste horário. Por favor, escolha outro horário.",
      });
      return;
    }

    const booking: Booking = {
      id: Date.now().toString(),
      laboratoryId: laboratory.id,
      laboratoryName: laboratory.name,
      roomId: room.id,
      roomName: room.name,
      startTime: slot.start.toISOString(),
      endTime: slot.end.toISOString(),
      responsible: formData.responsible,
      purpose: formData.purpose,
    };

    onSave(booking);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Laboratório</Label>
              <Input value={laboratory?.name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Sala</Label>
              <Input value={room?.name || ""} disabled />
            </div>

            {slot && (
              <>
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input value={formatDate(slot.start)} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input value={formatDate(slot.end)} disabled />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável *</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) =>
                  setFormData({ ...formData, responsible: e.target.value })
                }
                required
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Finalidade *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
                placeholder="Descreva a finalidade do uso..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar Agendamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
