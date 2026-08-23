import { PublicContactScreen } from "@/components/public-contact-screen";

export default async function PublicContactPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <PublicContactScreen username={username} />;
}
