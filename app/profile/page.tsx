"use client";
import { Tabs } from "flowbite-react";
import { HiAdjustments, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Spinner } from "flowbite-react";

export default function LoginPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/profile/signin");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex justify-center mt-64 h-screen">
        <Spinner aria-label="Loading" color="purple" />
      </div>
    );
  }
  return (
    <section>
      <Tabs.Group
        aria-label="Default tabs"
        style="default"
        className="flex justify-center text-gray-600 dark:text-gray-200 "
      >
        <Tabs.Item icon={HiUserCircle} title="Profile">
          {/* <p>{session?.user?.name} </p> */}
        </Tabs.Item>
        <Tabs.Item active icon={MdDashboard} title="Dashboard">
          <Dashboard />
        </Tabs.Item>
        <Tabs.Item icon={HiAdjustments} title="Settings">
          <div className="flex justify-center">
            <Settings />
          </div>
        </Tabs.Item>
        <Tabs.Item icon={FaUserFriends} title="Friends"></Tabs.Item>
      </Tabs.Group>
    </section>
  );
}
