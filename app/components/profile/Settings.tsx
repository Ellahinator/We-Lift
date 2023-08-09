"use client";
import { Avatar, Button, TextInput, Label, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Settings() {
  const { data: session, update } = useSession();

  let initialFirstName = "";
  let initialLastName = "";
  if (session?.user.name) {
    [initialFirstName, initialLastName] = session.user.name.split(" ");
  }
  let initialEmail = "";
  if (session?.user.email) {
    initialEmail = session.user.email;
  }
  let initialUsername = "";
  if (session?.user.username) {
    initialUsername = session.user.username;
  }

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(session?.user?.email || "");
  const [username, setUsername] = useState(session?.user.username || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingp, setLoadingp] = useState(false);
  const [loadingu, setLoadingu] = useState(false);

  const updateUserInformation = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoadingu(true);
    if (firstName === "") {
      setFirstName(initialFirstName);
    }
    if (lastName === "") {
      setLastName(initialLastName);
    }
    if (email === "") {
      setEmail(initialEmail);
    }
    if (username === "") {
      setUsername(initialUsername);
    }

    const fullName = `${firstName} ${lastName}`;
    try {
      const response = await fetch(
        "https://we-lift.onrender.com/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.jwt}`,
          },
          body: JSON.stringify({
            name: fullName,
            username: username,
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }
      await update({ name: fullName, username: username, email: email });
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoadingu(false);
    }
    console.log("User information updated!");
  };

  const updatePassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoadingp(true);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await fetch(
        "https://we-lift.onrender.com/profile/update/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.jwt}`,
          },
          body: JSON.stringify({
            old_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        setLoadingp(false);
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }
      console.log("Password updated successfully!");
    } catch (error: any) {
      setLoadingp(false);
      console.error(error);
    } finally {
      setLoadingp(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-6xl justify-center">
      <div className="col-span-full xl:col-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="flex space-x-4 p-4">
            <div className="2xl:flex-shrink-0">
              <Avatar
                img={session?.user?.image || "/avatar.svg"}
                alt="User picture"
                rounded={true}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold dark:text-white">
                Profile picture
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                JPG, GIF or PNG.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button color="primary">
                <svg
                  className="w-4 h-4 mr-2 -ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                  <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
                </svg>
                Upload picture
              </Button>
              <Button color="alternative">Delete</Button>
            </div>
          </div>
        </div>
        <div className="p-4 mb-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 className="mb-6 text-xl font-semibold dark:text-white">
            {" "}
            Password Information{" "}
          </h3>
          {session?.user!.provider === "google" ? (
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Logged in via Google. Manage your security settings in your{" "}
                <Link
                  href="https://myaccount.google.com/"
                  className=" text-green-500"
                >
                  Google Account
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={updatePassword}>
              <div className="grid grid-cols-1 gap-6">
                <div className="col-span-1">
                  <Label
                    htmlFor="current-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Current password
                  </Label>
                  <TextInput
                    type="password"
                    name="current-password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New password
                  </Label>
                  <TextInput
                    data-popover-target="popover-password"
                    data-popover-placement="bottom"
                    type="password"
                    id="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <div
                    data-popover
                    id="popover-password"
                    role="tooltip"
                    className="absolute z-10 invisible inline-block text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                  >
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Must have at least 6 characters
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
                        <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                      <p>It’s better to have:</p>
                      <ul>
                        <li className="flex items-center mb-1">
                          <svg
                            className="w-4 h-4 mr-2 text-green-400 dark:text-green-500"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          Upper & lower case letters
                        </li>
                        <li className="flex items-center mb-1">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-400"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          A symbol (#$&)
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-400"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          A longer password (min. 12 chars.)
                        </li>
                      </ul>
                    </div>
                    <div data-popper-arrow></div>
                  </div>
                </div>
                <div className="col-span-1">
                  <Label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm password
                  </Label>
                  <TextInput
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    type="submit"
                    disabled={loadingp}
                  >
                    {loadingp ? (
                      <div className="flex items-center space-x-2">
                        <Spinner color="gray" size="sm" />
                        <span className="pl-3">Updating...</span>
                      </div>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <form onSubmit={updateUserInformation}>
          <h3 className="mb-6 text-xl font-semibold dark:text-white">
            User Information
          </h3>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <Label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                First name
              </Label>
              <TextInput
                type="text"
                id="first_name"
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={initialFirstName || "John"}
                disabled={session?.user?.provider === "google"}
              />
            </div>
            <div>
              <Label
                htmlFor="last_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Last name
              </Label>
              <TextInput
                type="text"
                id="last_name"
                onChange={(e) => setLastName(e.target.value)}
                placeholder={initialLastName || "Doe"}
                disabled={session?.user?.provider === "google"}
              />
            </div>
          </div>
          <div className="mb-6">
            <Label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email address
            </Label>
            <TextInput
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={initialEmail || "john.doe@company.com"}
              disabled={session?.user?.provider === "google"}
            />
          </div>
          <div className="mb-6">
            <Label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Username
            </Label>
            <TextInput
              type="username"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder={initialUsername || "JohnDoe69"}
            />
          </div>
          <Button
            type="submit"
            className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            disabled={loadingu}
          >
            {loadingu ? (
              <div className="flex items-center space-x-2">
                <Spinner color="gray" size="sm" />
                <span className="pl-3">Updating...</span>
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
