"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc/client";
import { useTheme } from "@/components/ThemeProvider";

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

interface FundingModalProps {
  accountId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type FundingFormData = {
  amount: string;
  fundingType: "card" | "bank";
  accountNumber: string;
  routingNumber?: string;
};

export function FundingModal({ accountId, onClose, onSuccess }: FundingModalProps) {
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<FundingFormData>({
    defaultValues: {
      fundingType: "card",
    },
  });

  const fundingType = watch("fundingType");
  const fundAccountMutation = trpc.account.fundAccount.useMutation();

  useEffect(() => {
    setError("");
    clearErrors("accountNumber");
  }, [fundingType, clearErrors]);

  const onSubmit = async (data: FundingFormData) => {
    setError("");

    try {
      const amount = parseFloat(data.amount);

      await fundAccountMutation.mutateAsync({
        accountId,
        amount,
        fundingSource: {
          type: data.fundingType,
          accountNumber: data.accountNumber,
          routingNumber: data.routingNumber,
        },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to fund account");
    }
  };

  const inputClass = `mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${isDark ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`;
  const labelClass = `block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className={`rounded-lg max-w-md w-full p-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Fund Your Account</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className={`sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>$</span>
              </div>
              <input
                {...register("amount", {
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+\.?\d{0,2}$/,
                    message: "Invalid amount format",
                  },
                  min: {
                    value: 0.0,
                    message: "Amount must be at least $0.01",
                  },
                  max: {
                    value: 10000,
                    message: "Amount cannot exceed $10,000",
                  },
                })}
                type="text"
                className={`pl-7 block w-full rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border ${isDark ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          <div>
            <label className={`${labelClass} mb-2`}>Funding Source</label>
            <div className="space-y-2">
              <label className={`flex items-center ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                <input {...register("fundingType")} type="radio" value="card" className="mr-2" />
                <span>Credit/Debit Card</span>
              </label>
              <label className={`flex items-center ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                <input {...register("fundingType")} type="radio" value="bank" className="mr-2" />
                <span>Bank Account</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {fundingType === "card" ? "Card Number" : "Account Number"}
            </label>
            <input
              {...register("accountNumber", {
                required: `${fundingType === "card" ? "Card" : "Account"} number is required`,
                pattern: {
                  value: fundingType === "card" ? /^\d{16}$/ : /^\d+$/,
                  message: fundingType === "card" ? "Card number must be 16 digits" : "Invalid account number",
                },
                validate: {
                  luhn: (value) => {
                    if (fundingType !== "card") return true;
                    return luhnCheck(value) || "Invalid card number";
                  },
                },
              })}
              type="text"
              className={inputClass}
              placeholder={fundingType === "card" ? "1234567812345678" : "123456789"}
            />
            {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>}
          </div>

          {fundingType === "bank" && (
            <div>
              <label className={labelClass}>Routing Number</label>
              <input
                {...register("routingNumber", {
                  required: "Routing number is required",
                  pattern: {
                    value: /^\d{9}$/,
                    message: "Routing number must be 9 digits",
                  },
                })}
                type="text"
                className={inputClass}
                placeholder="123456789"
              />
              {errors.routingNumber && <p className="mt-1 text-sm text-red-600">{errors.routingNumber.message}</p>}
            </div>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium border rounded-md ${isDark ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={fundAccountMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {fundAccountMutation.isPending ? "Processing..." : "Fund Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
