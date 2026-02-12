"use client";

import { trpc } from "@/lib/trpc/client";
import { useTheme } from "@/components/ThemeProvider";

interface TransactionListProps {
  accountId: number;
}

export function TransactionList({ accountId }: TransactionListProps) {
  const { data: transactions, isLoading } = trpc.account.getTransactions.useQuery({ accountId });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className={`shadow rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Loading transactions...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={`shadow rounded-lg p-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className={`shadow overflow-hidden rounded-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
        <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Date</th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Type</th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Description
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Amount</th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"}`}>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                {formatDate(transaction.createdAt!)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <span className={`capitalize ${transaction.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                  {transaction.type}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {transaction.description ? <span dangerouslySetInnerHTML={{ __html: transaction.description }} /> : "-"}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <span className={transaction.type === "deposit" ? "text-green-600" : "text-red-600"}>
                  {transaction.type === "deposit" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === "completed"
                      ? isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"
                      : isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
