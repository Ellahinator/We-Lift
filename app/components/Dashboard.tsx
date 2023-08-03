import CalorieTracker from "./dashboard/CalorieTracker";
import ExerciseProgress from "./dashboard/ExerciseProgress";
import WeightGraph from ".//dashboard/WeightGraph";

export default function Dashboard() {
  return (
    <>
      <section className="grid grid-cols-3 p-12 gap-4">
        <WeightGraph />
        <CalorieTracker />
        <ExerciseProgress />
      </section>
    </>
  );
}
