import AboutSection from "@/components/AboutSection";

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <AboutSection audience="public" />
      </div>
    </main>
  );
}
