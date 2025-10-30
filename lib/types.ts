export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
}

export interface Laboratory {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description?: string;
  rooms?: Room[];
}

export interface Booking {
  id: string;
  laboratoryId: string;
  laboratoryName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  responsible: string;
  purpose: string;
}
