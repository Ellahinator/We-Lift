"use client";
import { Button } from "flowbite-react";
import Image from "next/image";

export default function UserProfileCard() {
  const user = {
    name: "John Doe",
    stats: {
      friends: 12,
      posts: 23,
      streak: 69,
    },
    currentWeight: "180 lbs",
    goalWeight: "160 lbs",
    exerciseProgress: "5/7 days",
    calorieIntake: "2500 kcal/day",
    workoutPreferences: "Strength Training",
    benchPR: "225lbs",
  };
  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col items-center p-10">
        <Image
          className="w-24 h-24 mb-3 rounded-full shadow-lg"
          src="https://randomuser.me/api/portraits/lego/5.jpg"
          alt="John Doe"
          width={96}
          height={96}
        />
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
          {user.name}
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.workoutPreferences}
        </span>
        <div className="flex mt-1 text-sm dark:text-white">
          <span className="font-bold mr-1">{user.stats.friends}</span> friends |
          <span className="font-bold ml-1 mr-1">{user.stats.posts}</span> posts
          |<span className="font-bold ml-1 mr-1">{user.benchPR}</span>
          Bench
        </div>
        <div className="flex mt-4 space-x-3 md:mt-6">
          <Button
            href="#"
            gradientDuoTone="purpleToPink"
            className="text-sm font-medium text-center text-white"
          >
            Add friend
          </Button>
          <Button
            href="#"
            className="text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
          >
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}
