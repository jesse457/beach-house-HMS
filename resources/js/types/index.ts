// resources/js/types/index.ts

export interface Amenity {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
}

export interface RoomType {
    id: number;
    name: string;
    description: string | null;
    base_price: string;
}

export interface Room {
    id: number;
    room_type_id: number;
    room_number: string;
    floor: string | number;
    status: string;
    price_per_night: string;
    pictures: string[];      // Array from JSON cast
    videos: string[];        // Array from JSON cast
    is_occupied: boolean;

    // Loaded Relations
    room_type?: RoomType;
    amenities?: Amenity[];
}

// resources/js/types/index.ts

// ... (previous interfaces: Room, RoomType, Amenity)

export interface Guest {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    id_card_number: string;
}

export interface Booking {
    id: number;
    guest_id: number;
    user_id: number | null;
    status: string;
    total_price: string;
    checked_in_at: string;
    checked_out_at: string;

    // Relations
    guest?: Guest;
    rooms?: Room[];
}
