import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: '51919633894-7k8rtf0m6j5h8dselujvjtqs4c4kgue0.apps.googleusercontent.com',
      clientSecret: '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'
      // clientId: process.env.GOOGLE_CLIENT_ID as string,
      // clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ]
};

const handler = NextAuth(authOptions);

export {
  handler as GET,
  handler as POST
};

