"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "flowbite-react";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ISeries {
  name: string;
  data: number[];
  color: string;
}

export default function CalorieTracker() {
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
        formatter: function (val: any, index: any) {
          return val;
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
          name: "Calorie Intake",
          data: [2020, 2700, 2300, 2000, 3000, 2323, 2727], // Sample weight data for a week
          color: "#4f46e5",
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
          type="bar"
          height={"100%"}
        />
      </div>
      <div className="flex items-center justify-between p-2">
        <div className="flex flex-col gap-4 p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Calorie Tracker
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            This graph represents your calorie intake over time. Keep up the
            good work!
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          as={Link}
          // href="/edit/calorie-tracker"
          href="#"
          outline
          pill
          size="xs"
          color="dark"
          className="w-1/2"
        >
          <p className="flex items-center">Edit</p>
          <HiOutlineArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
