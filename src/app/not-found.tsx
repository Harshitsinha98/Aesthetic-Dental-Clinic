import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center p-6 text-center">
      <div>
        <LogoMark className="mx-auto size-14" animated />
        <p className="mt-8 label-mono text-ink-mute">404 · Out of alignment</p>
        <h1 className="mt-4 text-5xl">This page isn’t here.</h1>
        <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-porcelain">Back to the home page</Link>
      </div>
    </main>
  );
}
