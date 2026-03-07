import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        const { data } = await supabase
          .from("users")
          .select("id, login_count")
          .eq("email", user.email)
          .single();

        if (data) {
          await supabase
            .from("users")
            .update({
              last_login_at: new Date().toISOString(),
              login_count: (data.login_count || 0) + 1,
              name: user.name,
              image: user.image,
            })
            .eq("email", user.email);
        } else {
          await supabase.from("users").insert({
            email: user.email,
            name: user.name,
            image: user.image,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
