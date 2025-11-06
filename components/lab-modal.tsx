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
import type { Lab } from "@/lib/types";

interface LabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lab: Lab) => void;
  lab: Lab | null;
}

export function LabModal({ isOpen, onClose, onSave, lab }: LabModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (lab) {
      setFormData({
        name: lab.name,
        capacity: lab.capacity.toString(),
        location: lab.location,
        description: lab.description || "",
      });
    } else {
      setFormData({
        name: "",
        capacity: "",
        location: "",
        description: "",
      });
    }
  }, [lab, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const labData: Lab = {
      id: lab?.id ?? Date.now(),
      name: formData.name,
      capacity: Number.parseInt(formData.capacity),
      location: formData.location,
      description: formData.description,
      rooms: lab?.rooms || [],
    };

    onSave(labData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {lab ? "Editar Laboratório" : "Novo Laboratório"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Laboratório *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Ex: Laboratório de Química"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
                placeholder="Ex: Bloco A - 2º Andar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade Total *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                required
                placeholder="Ex: 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o laboratório..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {lab ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
