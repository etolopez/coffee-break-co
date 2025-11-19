import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// NextAuth v4 configuration with proper setup
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple test authorization
        if (credentials?.email === 'admin@coffeebreak.com' && credentials?.password === 'password') {
          return {
            id: '1',
            email: 'admin@coffeebreak.com',
            name: 'Admin User',
            role: 'admin'
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || 'unknown';
        session.user.role = token.role as string || 'customer';
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };
