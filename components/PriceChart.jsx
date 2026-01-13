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
  const [currencyValue, setCurrencyValue] = useState("INR");
  useEffect(() => {
    const priceHistoryData = async () => {
      setLoading(true);
      try {
        const result = await getPriceHistory(productId);
        setCurrencyValue(result[0]?.currency);
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

  function CustomTooltip({ payload, label, active }) {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            border: "1px solid #888787",
            borderRadius: "2px",
            backgroundColor: "#fff",
            boxShadow: "none",
          }}
        >
          <div className="label" style={{ padding: "6px" }}>
            <div>
              <span style={{ fontSize: "14px" }}>{`${label}`}</span>
            </div>
            <div>
              Price:&nbsp;
              <b>
                <span style={{ fontSize: "12px" }}>{currencyValue}</span>&nbsp;
                {`${payload[0].value}`}
              </b>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-4 text-gray-700">
        Price History
      </h4>
      <ResponsiveContainer width="100%" height={120}>
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
            content={CustomTooltip}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#FA5D19"
            strokeWidth={2}
            dot={{ fill: "#FA5D19", r: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
