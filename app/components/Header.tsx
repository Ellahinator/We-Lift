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
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const authElement = (
    <div className="flex justify-end w-28">
      {session ? (
        <Dropdown
          inline
          label={
            <Avatar
              alt="User settings"
              img={session.user?.image || "/logo.png"}
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
            <Link href="/dashboard"> Dashboard</Link>
          </Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Item>Earnings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Dropdown.Item>
        </Dropdown>
      ) : (
        <Button
          onClick={() => signIn()}
          className="h-10 px-2 md:px-3 bg-primary-600 hover:bg-primary-700 focus:outline-none text-white rounded dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:bg-primary-400"
        >
          Sign in
        </Button>
      )}
    </div>
  );
  return (
    <Flowbite>
      <Navbar
        fluid
        className="dark:bg-gray-800 bg-gray-100 shadow-sm dark:shadow-none"
        border
      >
        <div className="flex w-full justify-between">
          <div className="flex">
            <Navbar.Brand href="/">
              <Image
                alt="Calorie App Logo"
                className="mr-3 h-6 sm:h-9"
                src="./logo.svg"
                width={32}
                height={32}
              />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-primary-400 text-primary-700">
                Calorie App
              </span>
            </Navbar.Brand>
          </div>
          <div className="flex items-center">
            <Navbar.Collapse>
              <Navbar.Link
                active
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <p>Home</p>
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                About
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Services
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Pricing
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Contact
              </Navbar.Link>
            </Navbar.Collapse>
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
