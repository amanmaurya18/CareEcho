import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

// Helper to sanitize env variables (strip quotes, whitespace, trailing slashes)
const cleanEnv = (val?: string) => (val ? val.trim().replace(/^['"]|['"]$/g, '') : '');

// Normalize base URL for Vercel / local development
const rawUrl =
  cleanEnv(process.env.NEXTAUTH_URL) ||
  (process.env.VERCEL_URL ? `https://${cleanEnv(process.env.VERCEL_URL)}` : '') ||
  (process.env.NODE_ENV === 'production'
    ? 'https://care-echo-omega.vercel.app'
    : 'http://localhost:3000');

// Ensure NEXTAUTH_URL is populated without trailing slash
const normalizedNextAuthUrl = rawUrl.replace(/\/+$/, '');
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = normalizedNextAuthUrl;
}

const googleClientId = cleanEnv(process.env.GOOGLE_CLIENT_ID);
const googleClientSecret = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
const githubId = cleanEnv(process.env.GITHUB_ID);
const githubSecret = cleanEnv(process.env.GITHUB_SECRET);
const nextAuthSecret =
  cleanEnv(process.env.NEXTAUTH_SECRET) ||
  'dAZjBxe9pE+ez6hoLqaX4Zf91/eau1nlpes53aBDDfk=';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    id: 'credentials',
    name: 'CareEcho Access',
    credentials: {
      name: { label: 'Name', type: 'text' },
      email: { label: 'Email', type: 'email' },
      role: { label: 'Role', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials) return null;
      const role = credentials.role || 'senior';
      const isCaregiver = role === 'caregiver';

      const defaultName = isCaregiver ? 'Sarah Vance' : 'Margaret Vance';
      const defaultEmail = isCaregiver
        ? 'sarah.caregiver@careecho.health'
        : 'margaret.vance@careecho.health';

      const name = credentials.name?.trim() || defaultName;
      const email = credentials.email?.trim() || defaultEmail;

      return {
        id: isCaregiver ? 'demo-caregiver-user' : 'demo-senior-user',
        name,
        email,
        image: isCaregiver
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80'
          : 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=120&h=120&q=80',
        role,
      };
    },
  }),
];

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  );
}

if (
  githubId &&
  githubSecret &&
  githubSecret !== 'your-github-client-secret' &&
  !githubSecret.includes('placeholder')
) {
  providers.push(
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: nextAuthSecret,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role || 'senior';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as any).role = (user as any).role || 'senior';
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};
