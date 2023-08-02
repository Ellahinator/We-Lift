import CalorieTracker from "../components/dashboard/CalorieTracker";
import ExerciseProgress from "../components/dashboard/ExerciseProgress";
import WeightGraph from "../components/dashboard/WeightGraph";

export default function Dashboard() {
  return (
    <section className="grid grid-cols-3 p-12 gap-4">
      <WeightGraph />
      <CalorieTracker />
      <ExerciseProgress />
    </section>
  );
}
