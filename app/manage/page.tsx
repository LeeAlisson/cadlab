"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  DoorOpen,
} from "lucide-react";
import Link from "next/link";
import type { Laboratory, Room } from "@/lib/types";
import { toast } from "sonner";
import { LabModal } from "@/components/lab-modal";
import { RoomModal } from "@/components/room-modal";

export default function ManagePage() {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    const storedLabs = localStorage.getItem("laboratories");
    if (storedLabs) {
      setLabs(JSON.parse(storedLabs));
    }
  }, []);

  const saveLabs = (updatedLabs: Laboratory[]) => {
    localStorage.setItem("laboratories", JSON.stringify(updatedLabs));
    setLabs(updatedLabs);
  };

  const handleDeleteLab = (labId: string) => {
    const updatedLabs = labs.filter((lab) => lab.id !== labId);
    saveLabs(updatedLabs);
    if (selectedLab?.id === labId) {
      setSelectedLab(null);
    }
    toast("Laboratório excluído", {
      description: "O laboratório foi removido com sucesso.",
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!selectedLab) return;

    const updatedLab = {
      ...selectedLab,
      rooms: selectedLab.rooms?.filter((room) => room.id !== roomId) || [],
    };

    const updatedLabs = labs.map((lab) =>
      lab.id === selectedLab.id ? updatedLab : lab
    );

    saveLabs(updatedLabs);
    setSelectedLab(updatedLab);

    toast("Sala excluída", {
      description: "A sala foi removida com sucesso.",
    });
  };

  const handleSaveLab = (lab: Laboratory) => {
    if (editingLab) {
      const updatedLabs = labs.map((l) => (l.id === lab.id ? lab : l));
      saveLabs(updatedLabs);
      if (selectedLab?.id === lab.id) {
        setSelectedLab(lab);
      }
      toast("Laboratório atualizado", {
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      saveLabs([...labs, lab]);
      toast("Laboratório cadastrado", {
        description: "O laboratório foi criado com sucesso.",
      });
    }
    setEditingLab(null);
  };

  const handleSaveRoom = (room: Room) => {
    if (!selectedLab) return;

    let updatedRooms: Room[];
    if (editingRoom) {
      updatedRooms =
        selectedLab.rooms?.map((r) => (r.id === room.id ? room : r)) || [];
      toast("Sala atualizada", {
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      updatedRooms = [...(selectedLab.rooms || []), room];
      toast("Sala cadastrada", {
        description: "A sala foi criada com sucesso.",
      });
    }

    const updatedLab = { ...selectedLab, rooms: updatedRooms };
    const updatedLabs = labs.map((lab) =>
      lab.id === selectedLab.id ? updatedLab : lab
    );

    saveLabs(updatedLabs);
    setSelectedLab(updatedLab);
    setEditingRoom(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Gerenciar Laboratórios
                </h1>
                <p className="text-muted-foreground mt-1">
                  Cadastre e edite laboratórios e salas
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingLab(null);
                setIsLabModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Laboratório
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Laboratórios
            </h2>
            <div className="space-y-4">
              {labs.map((lab) => (
                <Card
                  key={lab.id}
                  className={`cursor-pointer transition-all ${
                    selectedLab?.id === lab.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedLab(lab)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-foreground">
                          {lab.name}
                        </CardTitle>
                        <CardDescription>{lab.location}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLab(lab);
                            setIsLabModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLab(lab.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Capacidade: {lab.capacity}</span>
                      <span>Salas: {lab.rooms?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {labs.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-center">
                      Nenhum laboratório cadastrado
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedLab ? `Salas - ${selectedLab.name}` : "Salas"}
              </h2>
              {selectedLab && (
                <Button
                  onClick={() => {
                    setEditingRoom(null);
                    setIsRoomModalOpen(true);
                  }}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Sala
                </Button>
              )}
            </div>

            {!selectedLab ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DoorOpen className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    Selecione um laboratório para ver suas salas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedLab.rooms?.map((room) => (
                  <Card key={room.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-foreground">
                            {room.name}
                          </CardTitle>
                          <CardDescription>
                            Capacidade: {room.capacity} pessoas
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRoom(room);
                              setIsRoomModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {room.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {room.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                )) || []}

                {(!selectedLab.rooms || selectedLab.rooms.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <DoorOpen className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-center mb-4">
                        Nenhuma sala cadastrada
                      </p>
                      <Button
                        onClick={() => {
                          setEditingRoom(null);
                          setIsRoomModalOpen(true);
                        }}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Sala
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <LabModal
        isOpen={isLabModalOpen}
        onClose={() => {
          setIsLabModalOpen(false);
          setEditingLab(null);
        }}
        onSave={handleSaveLab}
        lab={editingLab}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
        room={editingRoom}
      />
    </div>
  );
}
