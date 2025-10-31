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
import { Building2, DoorOpen, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import type { Laboratory } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useApiService } from "@/lib/api";

export default function HomePage() {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [stats, setStats] = useState({
    totalLabs: 0,
    totalRooms: 0,
    totalBookings: 0,
  });
  const { user, token, loading: authLoading } = useAuth();
  const apiService = useApiService();

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const [laboratories, rooms, bookings] = await Promise.all([
        apiService.getLabs(token as string),
        apiService.getRooms(token as string),
        apiService.getBookings(token as string),
      ]);

      setStats({
        totalLabs: laboratories.length,
        totalRooms: rooms.length,
        totalBookings: bookings.length,
      });
    } catch (err) {
      console.error("Erro ao buscar dados separadamente:", err);
      throw err;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="bg-linear-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-chart-1">
                <Building2 className="h-5 w-5" />
                Laboratórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalLabs}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-chart-2">
                <DoorOpen className="h-5 w-5" />
                Salas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalRooms}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-chart-3">
                <Calendar className="h-5 w-5" />
                Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">
                {stats.totalBookings}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Reservas ativas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Laboratórios Cadastrados
            </h2>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie seus laboratórios
            </p>
          </div>
          <Link href="/manage">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Laboratório
            </Button>
          </Link>
        </div>

        {labs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum laboratório cadastrado
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Comece cadastrando seu primeiro laboratório para gerenciar salas
                e agendamentos
              </p>
              <Link href="/manage">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Laboratório
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <Card key={lab.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-foreground">{lab.name}</CardTitle>
                  <CardDescription>{lab.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Capacidade:</span>
                      <span className="font-medium text-foreground">
                        {lab.capacity} pessoas
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Salas:</span>
                      <span className="font-medium text-foreground">
                        {lab.rooms?.length || 0}
                      </span>
                    </div>
                    {lab.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {lab.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/manage?lab=${lab.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/schedule?lab=${lab.id}`} className="flex-1">
                      <Button className="w-full">Agendar</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
