import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
