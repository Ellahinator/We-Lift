"use client";
import { Button, Tabs } from "flowbite-react";
import {
  HiAdjustments,
  HiUserCircle,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";
import Profile from "../components/ProfileCard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/profile/signin");
    },
  });
  const [activeTab, setActiveTab] = useState("dashboard");

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
        aria-label="Tabs with underline"
        style="underline"
        className="flex justify-center text-gray-600 dark:text-gray-200 border dark:border-gray-700"
      >
        <Tabs.Item icon={HiUserCircle} title="Profile">
          <Profile />
        </Tabs.Item>
        <Tabs.Item active icon={MdDashboard} title="Dashboard">
          <Dashboard />
        </Tabs.Item>
        <Tabs.Item icon={HiAdjustments} title="Settings">
          <div className="flex justify-center">
            <Settings />
          </div>
        </Tabs.Item>
        <Tabs.Item icon={FaUserFriends} title="Friends">
          <div className="flex justify-center">
            <Button
              as={Link}
              href="/friends/add/example"
              gradientDuoTone="purpleToPink"
              className="shadow"
            >
              <p>Add Friend Example</p>
              <HiOutlineArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Tabs.Item>
      </Tabs.Group>
    </section>
  );
}
