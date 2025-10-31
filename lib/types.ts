export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export interface Room {
  id?: number;
  name: string;
  capacity: number;
  labId: number;
  description?: string;
}

export interface Lab {
  id?: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  rooms?: Room[];
}

export interface Booking {
  id?: number;
  labId: number;
  roomId: number;
  purpose: string;
  description?: string;
  userId: number;
  user: User;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled";
}
