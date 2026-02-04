import { redirect } from 'next/navigation';

export default function Home() {
  // Simple server-side redirect away from the root route.
  // After sign-in/sign-up, Clerk is configured (via env + ClerkProvider)
  // to send users to /dashboard, so we can safely send everyone who hits
  // "/" to the sign-in page without calling auth().
  redirect('/sign-in');
}
