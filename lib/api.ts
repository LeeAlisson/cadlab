import { useAuth } from "@/contexts/AuthContext";
import type { User, Lab, Room, Booking } from "./types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

class ApiService {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(getToken?: () => string | null) {
    this.baseUrl = API_BASE_URL;
    this.getToken = getToken || (() => localStorage.getItem("token"));
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Token expirado ou inválido");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  async register(userData: User) {
    const newUser = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };
    return this.request("/auth/register", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(newUser),
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    return this.request("/auth/login", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async validateToken(token: string) {
    return this.request("/auth/validate-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getLabs(token: string) {
    return this.request("/labs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createLab(token: string, labData: Omit<Lab, "id">) {
    return this.request("/labs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(labData),
    });
  }

  async updateLab(token: string, labId: number, labData: Partial<Lab>) {
    return this.request(`/labs/${labId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(labData),
    });
  }

  async deleteLab(token: string, labId: number) {
    return this.request(`/labs/${labId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getRooms(token: string) {
    return this.request("/rooms", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createRoom(token: string, roomData: Omit<Room, "id">) {
    return this.request("/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(token: string, roomId: number, roomData: Partial<Room>) {
    return this.request(`/rooms/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(token: string, roomId: number) {
    return this.request(`/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getBookings(token: string) {
    return this.request("/bookings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getBookingsByRoom(token: string, roomId: number) {
    return this.request(`/bookings/room/${roomId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createBooking(token: string, bookingData: Omit<Booking, "id">) {
    return this.request("/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(
    token: string,
    bookingId: number,
    bookingData: Partial<Booking>
  ) {
    return this.request(`/bookings/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(token: string, bookingId: number) {
    return this.request(`/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();

export function useApiService() {
  const { token } = useAuth();

  const apiService = new ApiService(() => token);
  return apiService;
}
