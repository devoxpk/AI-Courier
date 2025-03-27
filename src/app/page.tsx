import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/logo.svg"
            alt="AI Courier Logo"
            width={180}
            height={38}
            priority
          />
        </div>

        <div className="text-center sm:text-left max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Fast & Reliable Courier Services</h1>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
            Track your packages, manage deliveries, and experience seamless logistics with AI-powered courier solutions.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/track"
          >
            Track Package
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/login"
          >
            Customer Login
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold mb-2">Real-time Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track your shipments 24/7 with live updates</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold mb-2">Secure Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">End-to-end encrypted package protection</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-bold mb-2">Fast Shipping</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Express delivery options available</p>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about"
        >
          About Us
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/services"
        >
          Services
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/contact"
        >
          Contact
        </a>
      </footer>
    </div>
  );
}
