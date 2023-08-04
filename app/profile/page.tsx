"use client";
import { Tabs } from "flowbite-react";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import Dashboard from "../components/Dashboard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/profile/signin");
    },
  });

  if (!session) {
    // <Loading />;
  }
  return (
    <section>
      <Tabs.Group
        aria-label="Default tabs"
        style="default"
        className="flex justify-center text-gray-600 dark:text-gray-200 "
      >
        <Tabs.Item active icon={HiUserCircle} title="Profile">
          User
        </Tabs.Item>
        <Tabs.Item icon={MdDashboard} title="Dashboard">
          <Dashboard />
        </Tabs.Item>
        <Tabs.Item icon={HiAdjustments} title="Settings"></Tabs.Item>
        <Tabs.Item icon={HiClipboardList} title="Contacts"></Tabs.Item>
      </Tabs.Group>
    </section>
  );
}
