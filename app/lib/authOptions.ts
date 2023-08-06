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
          login: credentials!.email,
          password: credentials!.password,
        };
        const resp = await fetch("https://we-lift.onrender.com/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentialDetails),
        });
        console.log("Response", resp);
        const user = await resp.json();
        console.log("User", user);
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("Account", account);
      // If an access token is present, fetch a custom token from the backend
      if (account?.access_token) {
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
            console.log("Token", token);
            token.access_token = data.AuthToken;
          }
        } catch (error) {
          console.error("Error calling backend:", error);
        }
      }

      if (account?.provider === "credentials") {
        if (user) {
          console.log("User", user);
        }
      }
      return token;
    },
    session: async ({ session, token, user }) => {
      if (token) {
        console.log("Token", token);
        console.log("Session", session);
        session.user!.email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
