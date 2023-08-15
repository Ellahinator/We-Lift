"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function WeightGraphEx() {
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
    setChartOptions({
      ...chartOptions,
      xaxis: {
        ...chartOptions.xaxis,
        categories: [
          "01 Jan",
          "08 Jan",
          "15 Jan",
          "22 Jan",
          "29 Jan",
          "05 Feb",
          "12 Feb",
          "19 Feb",
          "26 Feb",
          "05 Mar",
          "12 Mar",
          "19 Mar",
          "26 Mar",
          "02 Apr",
          "09 Apr",
          "16 Apr",
          "23 Apr",
          "30 Apr",
          "07 May",
          "14 May",
          "21 May",
        ],
      },
      series: [
        {
          name: "Weight",
          data: [
            159.4, 158.6, 162.4, 163.0, 164.4, 164.6, 165.2, 164.6, 164.6,
            164.6, 164.8, 166.0, 162.8, 160.0, 160.4, 159.2, 158.8, 157.8,
            159.4, 160.0, 161.4,
          ],
          color: "#818cf8",
        },
      ],
    });
  }, [chartOptions]);

  return (
    <div className="shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-800 w-full">
      <div className="flex items-center justify-between p-2">
        <div className="flex flex-col gap-4 p-4">
          <h5 className="text-2xl font-semibold tracking-tight text-gray-500 dark:text-gray-200">
            Weight Graph
          </h5>
        </div>
      </div>
      <div className="w-full h-96">
        <Chart
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={"100%"}
        />
      </div>
    </div>
  );
}
