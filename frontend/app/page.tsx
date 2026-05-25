"use client"; // Required for useEffect in Next.js App Router

import { useEffect, useState } from "react"; // Import useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [data, setData] = useState("")
  // 1. Renamed function from `fetch` to `fetchData`
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data1 = await res.text();
      setData(data1);
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  // 2. Call the function when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means it runs once on mount

  return (
    <>
      <div className="">
        <div className="max-w-sm mx-auto"></div>
        <div>
          <p>{data}</p>
        </div>
      </div>
      <Card className="w-[500px] h-[500px]">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Track progress and recent activity for your Next.js app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Your design system is ready. Start building your next component.
        </CardContent>
      </Card>
    </>
  );
}