"use client";
import FriendCard from "../../../components/FriendCard";
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";

export default function UserProfileCard() {
  return (
    <div>
      <Breadcrumb aria-label="Breadcrumb navigation" className="p-6">
        <Breadcrumb.Item href="/" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/profile">Profile</Breadcrumb.Item>
        <Breadcrumb.Item>Friends</Breadcrumb.Item>
        <Breadcrumb.Item>Add Friend</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex justify-center">
        <FriendCard />
      </div>
    </div>
  );
}
