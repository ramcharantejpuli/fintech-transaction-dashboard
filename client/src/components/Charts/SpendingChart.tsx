import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { SpendingByCategory } from "../../types";
import { getSpendingByCategory } from "../../services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

const SpendingChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spendingData, setSpendingData] = useState<SpendingByCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSpendingByCategory();
        setSpendingData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load spending data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const chartData: ChartData = {
    labels: spendingData.map((item) => item.category),
    datasets: [
      {
        data: spendingData.map((item) => item.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#B366CC",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const data = spendingData[dataIndex];
            const value = context.formattedValue;
            return [
              `Amount: $${value}`,
              `Transactions: ${data.transactionCount}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="relative h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default SpendingChart;
