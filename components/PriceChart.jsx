"use client";

import { getPriceHistory } from "@/app/action";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PriceChart = ({ productId }) => {
  // local state for setting chart data and loading flag
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const priceHistoryData = async () => {
      setLoading(true);
      try {
        const result = await getPriceHistory(productId);
        console.log("Price history result:", result[0]);
        const chartData = result.map((item) => ({
          date: new Date(item.checked_at).toLocaleDateString(),
          price: parseFloat(item.price),
        }));

        if (result.error) {
          console.error("Error fetching price history:", result.error);
        } else {
          setChartData(chartData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching price history:", error);
        setLoading(false);
      }
    };

    priceHistoryData();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 w-full">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading chart...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 w-full">
        No price history yet. Check back after the first daily update!
      </div>
    );
  }

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-4 text-gray-700">
        Price History
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FA5D19"
            strokeWidth={2}
            dot={{ fill: "#FA5D19", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
