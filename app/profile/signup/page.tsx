"use client";
import { Button, Label, TextInput, Checkbox } from "flowbite-react";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Spinner } from "flowbite-react";

export default function SignupForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      redirect("/profile");
    }
  }, [session]);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (formData.password !== formData.repeatPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch("https://we-lift.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // username: null,
          email: formData.email,
          password_hash: formData.password,
        }),
      });
      console.log(response);

      if (response.ok) {
        console.log("Success");
        // Sign in the user with the same credentials
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          // Handle login error
          setErrorMessage(result.error);
        } else {
          // Redirect to completion page or wherever you'd like them to go post-login
          window.location.href = "/profile/signup/completion";
        }
      } else {
        const errorData = await response.json();
        console.log("Error Data", errorData);
        setErrorMessage(errorData.message || "Failed to register user");
      }
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

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
              Create your account
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
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label
                  htmlFor="repeatPassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </Label>
                <TextInput
                  type="password"
                  name="repeatPassword"
                  id="repeatPassword"
                  placeholder="••••••••"
                  required
                  value={formData.repeatPassword}
                  onChange={handleChange}
                />
              </div>
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
                        I accept the{" "}
                        <Link href="#" className="text-primary-600">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Spinner color="gray" size="sm" />
                    <span className="pl-3">Signing up...</span>
                  </div>
                ) : (
                  "Sign up"
                )}
              </Button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/profile/signin"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign in
                </Link>
              </p>
            </form>
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
