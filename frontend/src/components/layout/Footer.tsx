export default function Footer() {
  return (
    <footer className="border-t border-maroon/10 py-6 text-center">
      <p className="text-xs text-maroon/40">
        © {new Date().getFullYear()} KelanaAI. All rights reserved.
      </p>
    </footer>
  );
}
