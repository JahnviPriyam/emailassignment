import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Automatically configure NEXTAUTH_URL and NEXTAUTH_SECRET for Vercel deployments to prevent 500 Server Errors
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'reachinbox_production_secret_key_2026';
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_google_secret',
    }),
    CredentialsProvider({
      name: 'Demo / Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@reachinbox.ai' },
        name: { label: 'Name', type: 'text', placeholder: 'Jahnvi Priyam' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Please enter an email address for Demo login.');
        }
        return {
          id: 'dev_user_101',
          name: credentials.name || 'Jahnvi Priyam (Demo SDE)',
          email: credentials.email,
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || 'admin@reachinbox.ai';
        session.user.name = token.name || 'Jahnvi Priyam';
        session.user.image = token.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // We handle login UI directly on the landing dashboard page
  },
  secret: process.env.NEXTAUTH_SECRET || 'reachinbox_production_secret_key_2026',
};
