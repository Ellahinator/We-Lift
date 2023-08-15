"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "flowbite-react";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ExerciseProgress() {
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
          return val + "lbs"; // Changed to two decimal places for weight
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
    setChartOptions({
      ...chartOptions,
      xaxis: {
        ...chartOptions.xaxis,
        categories: [
          "01 Aug",
          "03 Aug",
          "05 Aug",
          "07 Aug",
          "09 Aug",
          "11 Aug",
          "13 Aug",
          "15 Aug",
          "17 Aug",
          "19 Aug",
          "21 Aug",
          "23 Aug",
          "25 Aug",
          "27 Aug",
          "29 Aug",
          "31 Aug",
        ], // Dates for the month of August
      },
      series: [
        {
          name: "Leg Press",
          data: [
            350, 355, 360, 370, 375, 380, 385, 390, 395, 400, 405, 410, 420,
            425, 430, 435,
          ],
          color: "#93eeea",
        },
        {
          name: "Bench Press",
          data: [
            125, 130, 135, 145, 150, 155, 160, 165, 160, 160, 165, 170, 175,
            180, 185, 185,
          ],
          color: "#4f46e5",
        },
        {
          name: "Squats",
          data: [
            185, 195, 195, 200, 205, 215, 220, 225, 230, 235, 240, 245, 250,
            255, 260, 265,
          ],
          color: "#ef4444",
        },
        {
          name: "Deadlifts",
          data: [
            225, 225, 240, 250, 250, 255, 265, 270, 275, 280, 285, 290, 295,
            300, 305, 310,
          ],
          color: "#22c55e",
        },
      ],
    });
  }, [chartOptions]);

  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-full">
      <div className="w-full h-96">
        <Chart
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={"100%"}
        />
      </div>
      <div className="flex items-center justify-between p-2">
        <div className="flex flex-col gap-4 p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Exercise Progress
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            This is a sample graph for exercise progress.
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          as={Link}
          // href="/edit/exercise"
          href="#"
          outline
          pill
          size="xs"
          color="dark"
          className="w-1/2"
          disabled
        >
          <p className="flex items-center">Edit</p>
          <HiOutlineArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
