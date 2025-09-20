import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-8 mt-10">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm font-medium">
            © {new Date().getFullYear()} EduPrepAI. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
