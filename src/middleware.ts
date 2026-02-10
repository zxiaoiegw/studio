import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/medications(.*)",
  "/reports(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const isDemoUser = req.cookies.get("pill_pal_demo")?.value === "true";
  if (isProtectedRoute(req) && !isDemoUser) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
