import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // /dashboard 配下は全てログイン必須
  matcher: ["/dashboard/:path*"],
};
