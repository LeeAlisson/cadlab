"use client";

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
import type { Lab, Room, Booking, User } from "@/lib/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => Promise<void>;
  laboratory: Lab | null;
  room: Room | null;
  user: User;
  slot: { start: Date; end: Date } | null;
  existingBookings: Booking[];
}

interface FormData {
  purpose: string;
  description?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onSave,
  laboratory,
  room,
  user,
  slot,
  existingBookings,
}: BookingModalProps) {
  const [formData, setFormData] = useState<FormData>({
    purpose: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        purpose: "",
        description: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Finalidade é obrigatória";
    } else if (formData.purpose.trim().length < 5) {
      newErrors.purpose = "Finalidade deve ter pelo menos 5 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkTimeConflict = (start: Date, end: Date): boolean => {
    if (!laboratory || !room) return false;

    return existingBookings.some((booking) => {
      if (booking.labId !== laboratory.id || booking.roomId !== room.id) {
        return false;
      }

      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (start < bookingEnd && end > bookingStart) ||
        (start.getTime() === bookingStart.getTime() &&
          end.getTime() === bookingEnd.getTime())
      );
    });
  };

  const validateTimeSlot = (start: Date, end: Date): string | null => {
    const now = new Date();

    if (start < now) {
      return "Não é possível agendar para horários passados";
    }

    if (end <= start) {
      return "Horário de término deve ser após o horário de início";
    }

    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (durationInMinutes < 30) {
      return "Agendamento mínimo é de 30 minutos";
    }

    if (durationInMinutes > 480) {
      // 8 hours
      return "Agendamento máximo é de 8 horas";
    }

    return null;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!laboratory || !room || !slot) {
      toast.error("Dados incompletos", {
        description: "Laboratório, sala e horário são obrigatórios.",
      });
      return;
    }

    if (!validateForm()) {
      toast.error("Formulário inválido", {
        description: "Verifique os campos destacados.",
      });
      return;
    }

    const timeError = validateTimeSlot(slot.start, slot.end);
    if (timeError) {
      toast.error("Horário inválido", {
        description: timeError,
      });
      return;
    }

    if (checkTimeConflict(slot.start, slot.end)) {
      toast.error("Conflito de horário", {
        description: "Já existe um agendamento neste horário.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: Booking = {
        labId: laboratory.id!,
        roomId: room.id!,
        userId: user.id!,
        startTime: slot.start.toISOString(),
        endTime: slot.end.toISOString(),
        user: user,
        status: "pending",
        purpose: formData.purpose!,
        description: formData.description!,
      };

      console.log("Dados do agendamento:", bookingData);

      await onSave(bookingData);
      onClose();
    } catch (error) {
      console.error("Error in booking modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (): string => {
    if (!slot) return "";

    const durationInMinutes =
      (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
    }
    return `${minutes}min`;
  };

  const isFormValid =
    formData.purpose.trim() && laboratory && room && user && slot;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laboratory">Laboratório</Label>
              <Input id="laboratory" value={laboratory?.name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Sala</Label>
              <Input id="room" value={room?.name || ""} disabled />
            </div>
          </div>

          {slot && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Início</Label>
                <Input id="startTime" value={formatDate(slot.start)} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Término</Label>
                <Input id="endTime" value={formatDate(slot.end)} disabled />
              </div>

              <div className="col-span-2">
                <Label htmlFor="duration">Duração</Label>
                <Input id="duration" value={calculateDuration()} disabled />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responsible" className="required">
                Responsável
              </Label>
              <Input id="responsible" value={user.name} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="required">
                Finalidade
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                required
                placeholder="Descreva a finalidade do uso da sala..."
                rows={3}
                className={errors.purpose ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Detalhes adicionais sobre o agendamento..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
