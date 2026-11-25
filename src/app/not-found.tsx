import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-lg">There is nothing at this address.</p>
      <p className="mt-8">
        <Link href="/" className="underline underline-offset-4">
          Go to the home page
        </Link>
      </p>
    </main>
  );
}
