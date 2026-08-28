import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TripHistory from "@/components/trip/TripHistory";

export const metadata = {
  title: "Trip History — KelanaAI",
  description: "Browse all your planned trips.",
};

export default function HistoryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-maroon">Trip History</h1>
            <p className="text-sm text-maroon/50 mt-2">All your planned trips in one place.</p>
          </div>
          <TripHistory />
        </div>
      </main>
      <Footer />
    </>
  );
}
