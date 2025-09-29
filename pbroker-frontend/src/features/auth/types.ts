export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
  }
  
  export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
    accessToken: string;
    refreshToken?: string;
    createdAt: Date;
    balance: number;
  }
  