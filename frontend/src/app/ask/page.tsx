import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QnaForm from "@/components/ask/QnaForm";

export const metadata = {
  title: "Travel Q&A — KelanaAI",
  description: "Ask anything about travel. Powered by AWS Knowledge Base.",
};

export default function AskPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-maroon">Travel Q&amp;A</h1>
            <p className="text-sm text-maroon/50 mt-2">
              Ask anything about destinations, visas, tips, and more — answered by our knowledge base.
            </p>
          </div>
          <QnaForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
