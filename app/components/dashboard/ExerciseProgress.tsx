"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ISeries {
  name: string;
  data: number[];
  color: string;
}

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
          return val.toFixed(2); // Changed to two decimal places for weight
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
          "02 Aug",
          "03 Aug",
          "04 Aug",
          "05 Aug",
          "06 Aug",
          "07 Aug",
        ], // Dates for a week in August
      },
      series: [
        {
          name: "Exercise Progress",
          data: [125, 130, 135, 140, 145, 150, 160], // Sample weight data for a week
          color: "#4f46e5",
        },
      ],
    });
  }, []);

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
    </div>
  );
}
