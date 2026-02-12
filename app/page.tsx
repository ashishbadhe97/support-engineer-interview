"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-5xl font-bold mb-6 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Welcome to SecureBank</h1>
          <p className={`text-xl mb-8 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Open your account today and experience modern banking at its finest. Simple, secure, and designed with you
            in mind.
          </p>

          <div className={`rounded-lg shadow-xl p-8 mb-8 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>Why Choose SecureBank?</h2>
            <ul className={`space-y-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                No monthly fees on checking accounts
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Competitive savings rates
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                24/7 customer support
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                State-of-the-art security
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Open an Account
            </Link>
            <Link
              href="/login"
              className={`px-8 py-3 rounded-lg font-semibold transition ${isDark ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
