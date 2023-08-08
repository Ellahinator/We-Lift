import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      provider: string | undefined | null;
      jwt: string | undefined | null;
    } & DefaultSession["user"];
  }

  interface User {
    AuthToken: string;
  }
}
