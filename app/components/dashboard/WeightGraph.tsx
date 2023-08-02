"use client";
import { Card } from "flowbite-react";

export default function WeightGraph() {
  return (
    <Card
      imgAlt="Meaningful alt text for an image that is not purely decorative"
      imgSrc="/graph.svg"
    >
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        <p>Weight</p>
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        <p>
          Here are the biggest enterprise technology acquisitions of 2021 so
          far, in reverse chronological order.
        </p>
      </p>
    </Card>
  );
}
