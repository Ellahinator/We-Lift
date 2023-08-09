import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Credentials", credentials);
        const credentialDetails = {
          user: credentials!.email,
          password: credentials!.password,
        };
        const resp = await fetch("https://we-lift.onrender.com/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentialDetails),
        });
        const user = await resp.json();
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ session, trigger, token, account, user }) {
      // If an access token is present, fetch a custom token from the backend
      if (account?.access_token) {
        console.log("Google Account", account);
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: account.access_token }),
        };
        try {
          const response = await fetch(
            "https://we-lift.onrender.com/auth/google",
            requestOptions
          );

          // Handle non-successful responses
          if (!response.ok) {
            console.error(`Error fetching token: ${response.statusText}`);
            return token; // Return the existing token if there's an error
          }

          // Extract and assign the custom token from the backend
          const data = await response.json();
          if (data?.AuthToken) {
            token.jwt = data.AuthToken;
            token.provider = account.provider;
            // TODO: uncomment after changing the backend response. remove above after.
            // token.jwt = data.jwt;
            // token.username = data.username;
            // token.provider = account.provider;
          }
        } catch (error) {
          console.error("Error calling backend:", error);
        }
      }

      if (account?.provider === "credentials") {
        if (user) {
          token.jwt = user.jwt;
          token.username = user.username;
          token.email = user.email;
          token.provider = account.provider;
          token.name = user.name;
          token.image = user.profile_pic;
        }
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
        token.username = session.username;
        token.email = session.email;
      }
      return token;
    },
    session: async ({ session, token, user }) => {
      if (token) {
        session.user.email = token.email;
        session.user.provider = token.provider as string;
        session.user.jwt = token.jwt as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
