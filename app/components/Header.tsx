"use client";
import {
  Dropdown,
  Navbar,
  Avatar,
  DarkThemeToggle,
  Button,
  Flowbite,
} from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const loading = status === "loading";

  const authElement = (
    <div className="flex justify-end w-28">
      {!loading &&
        (session ? (
          <Dropdown
            inline
            label={
              <Avatar
                alt="User settings"
                img={session.user?.image || "/avatar.svg"}
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">{session.user!.name}</span>
              <span className="block truncate text-sm font-medium">
                {session.user!.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item>
              <Link href="/profile"> Profile</Link>
            </Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        ) : pathname === "/" ? (
          <Button
            href="/profile"
            className="h-10 px-2 md:px-3 bg-primary-600 hover:bg-primary-700 focus:outline-none text-white rounded dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:bg-primary-400"
          >
            Sign in
          </Button>
        ) : null)}
    </div>
  );
  return (
    <Flowbite>
      <Navbar fluid className="dark:bg-gray-900 bg-gray-100">
        <div className="flex w-full justify-between">
          <div className="flex">
            <Navbar.Brand href="/">
              <Image
                alt="We Lift Logo"
                className="mr-3 h-6 sm:h-9"
                src="/logo.svg"
                width={32}
                height={32}
                placeholder="empty"
              />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-gray-100">
                We{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  Lift
                </span>
              </span>
            </Navbar.Brand>
          </div>

          <div className="flex items-center">
            {authElement}
            <DarkThemeToggle className=" ml-4" />
          </div>
        </div>
      </Navbar>
    </Flowbite>
  );
}
