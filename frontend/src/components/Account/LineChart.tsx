import "chart.js/auto";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import type { Transaction } from "../../lib/types";
import { formatDate } from "../../lib/utils";

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
        borderColor: "rgba(27, 58, 92, 1)",
        backgroundColor: "rgba(27, 58, 92, 0.1)",
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