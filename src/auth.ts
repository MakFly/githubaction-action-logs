/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "repo",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login", // Page de connexion personnalisée
    signOut: "/auth/signout", // Page de déconnexion personnalisée
    error: "/auth/error", // Page d'erreur personnalisée
    verifyRequest: "/auth/verify-request", // Page de vérification
    newUser: "/dashboard", // Redirection après inscription
  },
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      // Add the access token to the session for the API routes
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
