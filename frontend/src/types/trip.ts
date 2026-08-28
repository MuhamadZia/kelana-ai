export interface Trip {
  id:                number;
  destination:       string;
  days:              number;
  budget:            number;
  category:          string;
  daily_budget:      number;
  travel_style:      string | null;
  ai_recommendation: string | null;
}

export interface CreateTripPayload {
  destination:  string;
  days:         number;
  budget:       number;
  travel_style: string | null;
}

export interface GenerateTripPayload extends CreateTripPayload {
  travel_style: string;
}

export interface GetTripsParams {
  destination?: string;
  page?:        number;
  limit?:       number;
}

export interface PaginatedTripsResponse {
  total: number;
  page:  number;
  limit: number;
  items: Trip[];
}
