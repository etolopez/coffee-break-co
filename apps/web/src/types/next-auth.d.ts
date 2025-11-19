import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyName?: string;
      sellerId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    companyName?: string;
    sellerId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    companyName?: string;
    sellerId?: string;
  }
}
