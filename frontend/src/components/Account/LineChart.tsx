import "chart.js/auto";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { Transaction } from "@/lib/types";
import { formatDate, getCssVar } from "@/lib/utils";

interface LineChartProps {
  accountNumber: string;
  transactions: Transaction[];
}

export default function LineChart({ accountNumber, transactions }: LineChartProps) {
  const data = {
    labels: transactions.map((t) => formatDate(t.timestamp)),
    datasets: [
      {
        label: `Account #${accountNumber}`,
        data: transactions.map((t) => t.amount),
        borderColor: getCssVar("--color-primary"),
        backgroundColor: getCssVar("--color-primary") + "1a",
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: false },
    },
  };

  return <Line data={data} options={options} />;
}