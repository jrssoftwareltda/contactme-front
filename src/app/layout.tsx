import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ContactMeProvider } from "@/providers/contactme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Contact Me - Instant web messaging",
    template: "%s | Contact Me",
  },
  description: "Start conversations through a simple link. No app required.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en">
        <body>
          <ContactMeProvider>{children}</ContactMeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
