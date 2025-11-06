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
import type { Room } from "@/lib/types";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
  room?: Room | null;
  labId: number;
}

export function RoomModal({ isOpen, onClose, onSave, room, labId }: RoomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity.toString(),
        description: room.description || "",
      });
    } else {
      setFormData({
        name: "",
        capacity: "",
        description: "",
      });
    }
  }, [room, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const roomData: Room = {
      id: room?.id || Date.now(),
      name: formData.name,
      capacity: Number.parseInt(formData.capacity),
      description: formData.description,
      labId,
    };

    onSave(roomData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {room ? "Editar Sala" : "Nova Sala"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Nome da Sala *</Label>
              <Input
                id="room-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ex: Sala 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-capacity">Capacidade *</Label>
              <Input
                id="room-capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                required
                placeholder="Ex: 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-description">Descrição (Opcional)</Label>
              <Textarea
                id="room-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva a sala..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {room ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
