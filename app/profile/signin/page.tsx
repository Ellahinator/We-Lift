"use client";
import { Button, Label, TextInput, Checkbox } from "flowbite-react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Add this function to handle form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const response = await fetch("https://we-lift.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: email,
        password: password,
      }),
    });

    if (response.ok) {
      console.log("Success response", response);
      signIn("credentials", { email, password, callbackUrl: "/profile" });
    } else {
      // Handle error response
      if (response.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      console.log("Error response", response);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center mt-64 h-screen">
        <Spinner aria-label="Loading" color="purple" />
      </div>
    );
  }

  if (session) {
    redirect("/profile");
  }

  return (
    <section>
      <div className="flex flex-col items-center mt-8 px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          href="/"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <Image
            src="/logo.svg"
            alt="We Lift Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          We Lift
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:shadow-primary-950  md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:bg-opacity-30">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <Label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {" "}
                  Your email{" "}
                </Label>
                <TextInput
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </Label>
                <TextInput
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-red-500">{error}</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <div className="flex items-center h-5 gap-2">
                      <Checkbox
                        id="remember"
                        className="border-primary-300 bg-gray-100 focus:ring-2 focus:ring-primary-500 dark:border-primary-900 dark:bg-gray-700 dark:ring-offset-primary-800 dark:focus:ring-primary-600 text-primary-600"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-gray-500 dark:text-gray-300"
                      >
                        Remember me
                      </Label>
                    </div>
                  </div>
                </div>
                <Link
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Forgot password
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                onClick={handleSubmit}
              >
                Sign in
              </Button>
              <Button
                onClick={() => signIn("google")}
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in with Google
              </Button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don't have an account yet?{" "}
                <Link
                  href="/profile/signup"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
