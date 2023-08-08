"use client";
import { Label, TextInput } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

export default function ProfileCompletion() {
  const { data: session, update } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const updateUserProfile = async (fullName: string, username: string) => {
    try {
      const response = await fetch(
        "https://we-lift.onrender.com/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.jwt}`,
          },
          body: JSON.stringify({ name: fullName, username: username }),
        }
      );

      if (!response.ok) {
        // Handle error
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(error);
      return { error: error.message };
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const fullName = `${firstName} ${lastName}`;

    const res = await updateUserProfile(fullName, username);

    if (res) {
      console.log("Success");
      // Redirect to dashboard or welcome page if successful
      // Update the session on the client side with the new name and username
      await update({ name: fullName, username: username });
      window.location.href = "/profile";
    } else {
      console.log("Error");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="m-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 w-1/2 max-w-2xl">
        <form onSubmit={handleSubmit}>
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
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
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
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Username
              </Label>
              <TextInput
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </Label>
              <TextInput
                type="email"
                id="visitors"
                placeholder={session?.user.email || ""}
                disabled
              />
            </div>
          </div>

          <button
            type="submit"
            className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
