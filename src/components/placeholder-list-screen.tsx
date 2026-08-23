import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";

export function PlaceholderListScreen({ title, description }: { title: string; description: string }) {
  return (
    <section className="screen placeholder-screen">
      <div className="screen-content">
        <div className="desktop-screen-title"><div><h1>{title}</h1><p>{description}</p></div></div>
        <div className="placeholder-card"><span><MessagesSquare size={30} /></span><h2>{title}</h2><p>This section is part of the navigation wireframe and is ready for the next feature iteration.</p><Link className="button button--primary" href="/app">Back to conversations <ArrowRight size={17} /></Link></div>
      </div>
    </section>
  );
}
