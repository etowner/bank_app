import "chart.js/auto";
import type { ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { Account } from "@/lib/types";

export default function PieChart({ accounts }: { accounts: Account[] }) {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const percentages = accounts.map(account => 
    totalBalance > 0 ? (account.balance / totalBalance) * 100 : 0
  );

  const data = {
    labels: accounts.map((account) => `${account.type} - ${account.accountNumber}`),
    datasets: [
      {
        label: "%",
        data: percentages,
        backgroundColor: [
          "rgba(27,  58,  92,  1)",  
          "rgba(212, 168, 67,  1)",   
          "rgba(107, 124, 147, 1)",   
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
    },
    layout: {
      padding: 20,
    },

  };

  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  );
}
