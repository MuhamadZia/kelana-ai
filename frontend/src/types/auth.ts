export interface User {
  id:    number;
  name:  string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type:   string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}
