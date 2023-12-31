// "use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/Header";
// import { usePathname } from "next/navigation";
import Provider from "./components/Provider";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "We Lift",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();
  // const showHeader = pathname !== "/profile" && pathname !== "/profile/signup";
  const showHeader = true;
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col">
          <Provider>
            {showHeader && <Header />}
            <main className="">{children}</main>
          </Provider>
        </div>
      </body>
    </html>
  );
}
