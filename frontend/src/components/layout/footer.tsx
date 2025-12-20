import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary">
                school
              </span>
              <span className="text-2xl font-bold text-text-main">
                SeniorLearn
              </span>
            </div>
            <p className="max-w-xs text-lg text-text-secondary">
              Making technology and learning accessible for everyone, at any
              age.
            </p>
          </div>

          {/* Help Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-text-main">Need Help?</h4>
            <a
              className="flex items-center gap-3 text-2xl font-bold text-primary hover:underline"
              href="tel:02-123-4567"
            >
              <span className="material-symbols-outlined">call</span>
              02-123-4567
            </a>
            <p className="text-lg text-text-secondary">
              Daily 8:00 AM - 6:00 PM
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold text-text-main">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-lg text-text-secondary hover:text-primary"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-lg text-text-secondary hover:text-primary"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-lg text-text-secondary hover:text-primary"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 text-center md:text-left">
          <p className="text-base text-text-secondary">
            © {new Date().getFullYear()} SeniorLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
