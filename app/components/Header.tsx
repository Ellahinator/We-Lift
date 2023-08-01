"use client";

import {
  Dropdown,
  Navbar,
  Avatar,
  DarkThemeToggle,
  Button,
  Flowbite,
} from "flowbite-react";
import { useState } from "react";

export default function NavbarWithDropdown() {
  const [isSignedIn, setIsSignedIn] = useState(false); // initially, the user is not signed in

  const authElement = isSignedIn ? (
    <Dropdown inline label={<Avatar alt="User settings" rounded />}>
      <Dropdown.Header>
        <span className="block text-sm">Bonnie Green</span>
        <span className="block truncate text-sm font-medium">
          name@flowbite.com
        </span>
      </Dropdown.Header>
      <Dropdown.Item>Dashboard</Dropdown.Item>
      <Dropdown.Item>Settings</Dropdown.Item>
      <Dropdown.Item>Earnings</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => setIsSignedIn(false)}>
        Sign out
      </Dropdown.Item>
    </Dropdown>
  ) : (
    <Button
      onClick={() => setIsSignedIn(true)}
      className="h-10 px-2 md:px-3 bg-primary-600 hover:bg-primary-700 focus:outline-none text-white rounded dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:bg-primary-400"
    >
      Sign in
    </Button>
  );
  return (
    <Flowbite>
      <Navbar fluid className="dark:bg-gray-800 bg-gray-100" border>
        <div className="flex w-full justify-between">
          <div className="flex">
            <Navbar.Brand href="/">
              <img
                alt="Flowbite React Logo"
                className="mr-3 h-6 sm:h-9"
                src="./logo.svg"
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
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400"
              >
                Home
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400"
              >
                About
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400"
              >
                Services
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400"
              >
                Pricing
              </Navbar.Link>
              <Navbar.Link
                active
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400"
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
