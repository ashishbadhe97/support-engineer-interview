"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { AccountCreationModal } from "@/components/AccountCreationModal";
import { FundingModal } from "@/components/FundingModal";
import { TransactionList } from "@/components/TransactionList";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardPage() {
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [fundingAccountId, setFundingAccountId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: accounts, refetch: refetchAccounts } = trpc.account.getAccounts.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <nav className={`shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>SecureBank Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className={`ml-4 px-4 py-2 text-sm font-medium ${isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Your Accounts</h2>

            {accounts && accounts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition ${isDark ? "bg-gray-800" : "bg-white"}`}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <dt className={`text-sm font-medium truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
                      </dt>
                      <dd className={`mt-1 text-3xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{formatCurrency(account.balance)}</dd>
                      <dd className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Account: ****{account.accountNumber.slice(-4)}</dd>
                      <dd className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            account.status === "active" ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {account.status}
                        </span>
                      </dd>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFundingAccountId(account.id);
                        }}
                        className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Fund Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-lg shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>You don't have any accounts yet.</p>
              </div>
            )}

            <button
              onClick={() => setIsCreatingAccount(true)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700"
            >
              Open New Account
            </button>
          </div>

          {selectedAccountId && (
            <div className="mt-8">
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Transaction History</h3>
              <TransactionList accountId={selectedAccountId} />
            </div>
          )}
        </div>
      </main>

      {isCreatingAccount && (
        <AccountCreationModal
          onClose={() => setIsCreatingAccount(false)}
          onSuccess={() => {
            setIsCreatingAccount(false);
            refetchAccounts();
          }}
        />
      )}

      {fundingAccountId && (
        <FundingModal
          accountId={fundingAccountId}
          onClose={() => setFundingAccountId(null)}
          onSuccess={() => {
            setFundingAccountId(null);
            refetchAccounts();
          }}
        />
      )}
    </div>
  );
}
