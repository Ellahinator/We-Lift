"use client";
import { Label, TextInput } from "flowbite-react";
import { useState } from "react";

export default function ProfileCompletion() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Collect the user details and call backend API to update the user profile

    // Redirect to dashboard or welcome page if successful
    window.location.href = "/profile";
  };

  return (
    <div className="flex justify-center">
      <div className="p-4 m-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 w-3/5">
        <form onSubmit={handleSubmit}>
          <h3 className="mb-6 text-xl font-semibold dark:text-white">
            {" "}
            General Information{" "}
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
              <TextInput type="text" id="username" placeholder="" required />
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
                placeholder="name@company.com"
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
