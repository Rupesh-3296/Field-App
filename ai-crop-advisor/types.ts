
export type Language = 'en' | 'es' | 'hi' | 'te' | 'ta' | 'kn';

export interface Crop {
  cropName: string;
  description: string;
  plantingSeason: string;
  waterNeeds: string;
  marketValue: string;
  soilPreference?: string;
  scientificName?: string;
  emoji: string;
}

export interface FormData {
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  soilType: string;
  climate: string;
  cost: string;
}

export interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | { message: string; code?: number } | null;
  data: {
    latitude: number | null;
    longitude: number | null;
    locationName: string | null;
  };
}