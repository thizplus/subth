/**
 * Public layout for unauthenticated pages
 * - Login
 * - OAuth callback
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
