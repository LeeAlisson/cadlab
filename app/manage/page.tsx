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
import { Building2, Plus, Trash2, Edit2, DoorOpen } from "lucide-react";
import type { Lab, Room } from "@/lib/types";
import { toast } from "sonner";
import { LabModal } from "@/components/lab-modal";
import { RoomModal } from "@/components/room-modal";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useApiService } from "@/lib/api";

export default function ManagePage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, token, loading: authLoading } = useAuth();
  const apiService = useApiService();

  useEffect(() => {
    if (user && token) {
      fetchLabs();
    }
  }, [user, token]);

  const fetchLabs = async () => {
    try {
      setIsLoading(true);
      const laboratories = await apiService.getLabs(token as string);
      setLabs(laboratories);
    } catch (error) {
      console.error("Erro ao carregar laboratórios:", error);
      toast("Erro", {
        description: "Não foi possível carregar os laboratórios.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLab = async (labId: string) => {
    try {
      await apiService.deleteLab(token as string, Number(labId));

      const updatedLabs = labs.filter((lab) => lab.id !== Number(labId));
      setLabs(updatedLabs);

      if (selectedLab?.id === Number(labId)) {
        setSelectedLab(null);
      }

      toast("Laboratório excluído", {
        description: "O laboratório foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir laboratório:", error);
      toast("Erro", {
        description: "Não foi possível excluir o laboratório.",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!selectedLab) return;

    try {
      await apiService.deleteRoom(token as string, Number(roomId));

      const updatedLab = {
        ...selectedLab,
        rooms:
          selectedLab.rooms?.filter((room) => room.id !== Number(roomId)) || [],
      };

      const updatedLabs = labs.map((lab) =>
        lab.id === selectedLab.id ? updatedLab : lab
      );

      setLabs(updatedLabs);
      setSelectedLab(updatedLab);

      toast("Sala excluída", {
        description: "A sala foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir sala:", error);
      toast("Erro", {
        description: "Não foi possível excluir a sala.",
      });
    }
  };

  const handleSaveLab = async (labData: Lab) => {
    try {
      if (editingLab) {
        const labToUpdate = { ...labData, rooms: editingLab.rooms || [] };
        const { id, rooms, ...labWithoutId } = labToUpdate;
        console.log("Updating lab with data:", labToUpdate);

        const updatedLab = await apiService.updateLab(
          token as string,
          Number(id),
          labWithoutId
        );

        console.log("Updated lab:", updatedLab);

        const updatedLabs = labs.map((l) =>
          l.id === editingLab.id ? updatedLab : l
        );

        setLabs(updatedLabs);

        if (selectedLab?.id === editingLab.id) {
          setSelectedLab(updatedLab);
        }

        toast("Laboratório atualizado", {
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        const labToCreate = { ...labData, rooms: [] };

        const { id, ...labWithoutId } = labToCreate;

        console.log("Creating lab with data:", labWithoutId);

        const newLab = await apiService.createLab(
          token as string,
          labWithoutId
        );

        setLabs((prev) => [...prev, newLab]);

        toast("Laboratório cadastrado", {
          description: "O laboratório foi criado com sucesso.",
        });
      }

      setEditingLab(null);
      setIsLabModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar laboratório:", error);
      toast("Erro", {
        description: "Não foi possível salvar o laboratório.",
      });
    }
  };

  const handleSaveRoom = async (roomData: Partial<Room>) => {
    if (!selectedLab) return;

    try {
      if (editingRoom) {
        const { id, ...roomWithoutId } = roomData;
        const updatedRoom = await apiService.updateRoom(
          token as string,
          Number(editingRoom.id),
          roomWithoutId
        );

        const updatedRooms =
          selectedLab.rooms?.map((r) =>
            r.id === editingRoom.id ? updatedRoom : r
          ) || [];

        const updatedLab = { ...selectedLab, rooms: updatedRooms };
        const updatedLabs = labs.map((lab) =>
          lab.id === selectedLab.id ? updatedLab : lab
        );

        setLabs(updatedLabs);
        setSelectedLab(updatedLab);

        toast("Sala atualizada", {
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        console.log(selectedLab.id);
        const newRoomData = {
          name: roomData.name!,
          capacity: roomData.capacity!,
          labId: Number(selectedLab.id!),
          description: roomData.description || "",
        };

        const newRoom = await apiService.createRoom(
          token as string,
          newRoomData
        );

        const updatedRooms = [...(selectedLab.rooms || []), newRoom];
        const updatedLab = { ...selectedLab, rooms: updatedRooms };
        const updatedLabs = labs.map((lab) =>
          lab.id === selectedLab.id ? updatedLab : lab
        );

        setLabs(updatedLabs);
        setSelectedLab(updatedLab);

        toast("Sala cadastrada", {
          description: "A sala foi criada com sucesso.",
        });
      }

      setEditingRoom(null);
      setIsRoomModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar sala:", error);
      toast("Erro", {
        description: "Não foi possível salvar a sala.",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user || !token) {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Gerenciar Laboratórios
            </h2>
            <p className="text-muted-foreground mt-1">
              Cadastre e edite laboratórios e salas
            </p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Laboratórios
            </h3>
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
                            handleDeleteLab(String(lab.id));
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
              <h3 className="text-xl font-semibold text-foreground">
                {selectedLab ? `Salas - ${selectedLab.name}` : "Salas"}
              </h3>
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
                            onClick={() => handleDeleteRoom(String(room.id))}
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

      {selectedLab && (
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
        room={editingRoom}
        labId={selectedLab.id}
      />
    )}
  );
}
