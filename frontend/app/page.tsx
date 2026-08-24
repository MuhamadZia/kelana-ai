import Image from "next/image";

export default function Home() {
  return (
    <form>
      <input name="destination" />
      <input name="budget" />
      <input name="days" />
      <input name="travel_style" />
      <button>Generate AI Trip</button>
    </form>
  );
}
