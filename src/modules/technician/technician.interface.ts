export type TTechnicianProfileUpdateInput = {
  bio?: string;
  skills?: string[];
  experience?: number;
  pricing?: number;
  categoryId?: string;
  availabilitySlots?: { slot: string }[];
};

export type TUpdateAvailabilityInput = {
  availabilities: {
    slot: string;
    startTime: string | Date;
    endTime: string | Date;
  }[];
};
export type TUpdateBookingStatusInput = {
  status: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED";
};

export interface ITechnicianFilterRequest {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
}
