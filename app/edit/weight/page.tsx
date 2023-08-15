"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function WeightData() {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/profile/signin");
    },
  });
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

  const [chartOptions, setChartOptions] = useState({
    // other options same as before
    xaxis: {
      categories: [] as string[],
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: function (val: number, index: any) {
          return val.toFixed(1) + "lbs"; // Changed to one decimal place for weight
        },
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    series: [] as ISeries[],
  });

  // set up chart data when component is mounted
  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        const response = await fetch(
          "https://we-lift.onrender.com/weight-data",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.jwt}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const responseData = await response.json();
        const dataPoints = responseData.data_points;
        dataPoints.sort(
          (
            a: { date: string | number | Date },
            b: { date: string | number | Date }
          ) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const categories = dataPoints.map(
          (entry: { date: string | number | Date }) =>
            new Date(entry.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
            })
        );
        const data = dataPoints.map(
          (entry: { weight: number }) => entry.weight
        );

        setChartOptions({
          ...chartOptions,
          xaxis: {
            ...chartOptions.xaxis,
            categories: categories,
          },
          series: [
            {
              name: "Weight",
              data: data,
              color: "#818cf8",
            },
          ],
        });
      } catch (error) {
        console.error(
          "An error occurred while fetching the weight data:",
          error
        );
      }
    };

    fetchWeightData();
  }, [chartOptions, session]);

  return (
    <div className="flex justify-center p-6">
      <div className="shadow-lg rounded-2xl p-8 bg-white dark:bg-gray-800 w-1/2">
        <div className="w-full h-96">
          <Chart
            options={chartOptions}
            series={chartOptions.series}
            type="line"
            height={"100%"}
          />
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
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
          <div className="mt-4">
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
    </div>
  );
}
