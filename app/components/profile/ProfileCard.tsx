import { Card, Avatar } from "flowbite-react";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  const user = {
    name: session?.user?.name || "John Doe",
    avatar: session?.user?.image || "/avatar.svg",
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
  };

  return (
    <section className="flex justify-center">
      <Card className=" w-2/4 max-w-xl">
        <div className="grid grid-cols-2 ">
          <div>
            <div className="flex items-center">
              <Avatar img={user.avatar} rounded={true} />
              <div className="ml-4">
                <p className="text-lg font-medium">{user.name}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">{user.stats.friends}</span> friends
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">{user.stats.posts}</span> posts
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">{user.stats.streak}</span> day
                streak 🔥
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">Current Weight:</span>{" "}
                {user.currentWeight}
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">Goal Weight:</span>{" "}
                {user.goalWeight}
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">Excercise:</span>{" "}
                {user.exerciseProgress}
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">Calories:</span>{" "}
                {user.calorieIntake}
              </p>
              <p className="text-gray-600 dark:text-gray-200">
                <span className="font-bold">Workouts:</span>{" "}
                {user.workoutPreferences}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
