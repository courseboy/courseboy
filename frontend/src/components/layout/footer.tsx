import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-secondary-50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary-600">
              CourseBoy
            </h3>
            <p className="text-sm text-secondary-600">
              Learn skills that matter. Access quality education from anywhere.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Learn</h4>
            <ul className="space-y-2 text-sm text-secondary-600">
              <li>
                <Link href="/courses" className="hover:text-primary-600">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="hover:text-primary-600">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-secondary-600">
              <li>
                <Link href="/about" className="hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary-600">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-secondary-600">
              <li>
                <Link href="/privacy" className="hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-secondary-600">
          <p>
            &copy; {new Date().getFullYear()} CourseBoy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
