"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { redirect } from "next/navigation";

export default function WeightData() {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Submitting...");
    setLoading(true);

    // Prepare the data
    const data = {
      weight: parseFloat(weight),
      date: date,
    };
    try {
      const response = await fetch(
        "https://we-lift.onrender.com/weight-data/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.jwt}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      redirect("/profile");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-1/2">
      todo: add chart
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="weight">Weight:</Label>
          <TextInput
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date:</Label>
          <TextInput
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Button type="submit" color="dark" disabled={loading}>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Spinner color="gray" size="sm" />
                <span className="pl-3">Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
      {/* resposne msg */}
    </div>
  );
}
