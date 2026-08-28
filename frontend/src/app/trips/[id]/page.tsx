import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TripDetail from "@/components/trip/TripDetail";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const tripId = Number(id);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-14">
        <TripDetail tripId={tripId} />
      </main>
      <Footer />
    </>
  );
}
