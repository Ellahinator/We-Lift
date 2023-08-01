"use client";
import Header from "./components/Header";
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";

export default function HomePage() {
  return (
    <div>
      <Header />
      <div className="m-4">
        <Breadcrumb aria-label="Home">
          <Breadcrumb.Item href="#" icon={HiHome}>
            <p>Home</p>
          </Breadcrumb.Item>
          <Breadcrumb.Item href="#">Progress</Breadcrumb.Item>
          <Breadcrumb.Item> Weight </Breadcrumb.Item>
        </Breadcrumb>
      </div>
    </div>
  );
}
