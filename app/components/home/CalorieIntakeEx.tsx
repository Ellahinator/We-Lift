"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function CalorieIntakeEx() {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: false,
          selection: true,
          zoom: false,
          zoomin: true,
          zoomout: true,
          reset: false,
          pan: false,
        },
      },
    },
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
          return val + "kcal";
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
      <div className="flex items-center justify-between p-2">
        <div className="flex flex-col gap-4 p-4">
          <h5 className="text-2xl font-semibold tracking-tight text-gray-500 dark:text-gray-200">
            Calorie Tracker
          </h5>
        </div>
      </div>
      <div className="w-full h-96">
        <Chart
          options={chartOptions}
          series={chartOptions.series}
          type="bar"
          height={"100%"}
        />
      </div>
    </div>
  );
}
