import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      provider: string | undefined | null;
      jwt: string | undefined | null;
      username: string | undefined | null;
    } & DefaultSession["user"];
  }

  interface User {
    jwt: string | undefined | null;
    username: string | undefined | null;
    profile_pic: string | undefined | null;
  }
}
