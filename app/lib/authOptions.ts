import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
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
            token.access_token = data.AuthToken;
          }
        } catch (error) {
          console.error("Error calling backend:", error);
        }
      }
      return token;
    },
  },
};
