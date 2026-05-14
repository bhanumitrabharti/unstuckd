import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unstuckd',
  description: 'AI + Human Touch Expert Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}