import { Room } from "./Room";

export interface Lab {
  id?: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  rooms?: Room[];
}
