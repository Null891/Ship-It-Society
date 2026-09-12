import { permanentRedirect } from "next/navigation";

/* The team page became /about, which carries the club's own description as
   well as the officers. This keeps the old path working for anyone who
   bookmarked or linked it. */
export default function TeamPage() {
  permanentRedirect("/about");
}
