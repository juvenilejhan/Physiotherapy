import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole, AccountType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Note: Not using PrismaAdapter since we handle user creation manually in signIn callback
  // This allows OAuth login to work with JWT strategy
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            patientProfile: true,
            staffProfile: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated. Please contact support.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          accountType: user.accountType,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth?.toISOString() || null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // For OAuth or initial sign in, fetch user from database
      if (user && account) {
        // For OAuth providers, fetch the database user by email
        if (account.provider !== "credentials" && user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.role = dbUser.role;
            token.accountType = dbUser.accountType;
            token.phone = dbUser.phone;
            token.dateOfBirth = dbUser.dateOfBirth?.toISOString() || null;
            token.picture = dbUser.image || user.image;
          }
        } else {
          // For credentials provider, user object already has DB data
          token.id = user.id;
          token.name = user.name;
          token.role = (user as any).role;
          token.accountType = (user as any).accountType;
          token.phone = (user as any).phone;
          token.dateOfBirth = (user as any).dateOfBirth;
        }
      }

      // Update token when session is updated
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).role = token.role;
        (session.user as any).accountType = token.accountType;
        (session.user as any).phone = token.phone;
        (session.user as any).dateOfBirth = token.dateOfBirth;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for existing accounts
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers, PrismaAdapter handles user/account creation
      // We just need to:
      // 1. Check if user is active (if existing)
      // 2. Update user info from OAuth profile
      if (user?.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Check if user is active
          if (!existingUser.isActive) {
            return false;
          }

          // Update account type if not set correctly
          if (existingUser.accountType === AccountType.CREDENTIALS) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                accountType:
                  account?.provider === "google"
                    ? AccountType.GOOGLE
                    : account?.provider === "facebook"
                      ? AccountType.FACEBOOK
                      : existingUser.accountType,
                image: user.image || existingUser.image,
              },
            });
          }
          return true;
        }

        // For new users, PrismaAdapter will create the user
        // But we need to set our custom fields via the adapter's createUser
        // Create user here since adapter might not set our custom fields
        try {
          const newUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name || (profile as any)?.name || "User",
              image: user.image,
              role: UserRole.PATIENT,
              accountType:
                account?.provider === "google"
                  ? AccountType.GOOGLE
                  : account?.provider === "facebook"
                    ? AccountType.FACEBOOK
                    : AccountType.CREDENTIALS,
              emailVerified: true,
              isActive: true,
            },
          });

          // Update the user object with the new ID for jwt callback
          user.id = newUser.id;
          (user as any).role = newUser.role;
          (user as any).accountType = newUser.accountType;

          console.log("Created new OAuth user:", newUser.email);
          return true;
        } catch (error) {
          console.error("Error creating OAuth user:", error);
          // User might already exist (race condition), try to continue
          return true;
        }
      }

      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend the NextAuth types
declare module "next-auth" {
  interface User {
    role: UserRole;
    accountType: AccountType;
    phone?: string | null;
    dateOfBirth?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      accountType: AccountType;
      phone?: string | null;
      dateOfBirth?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accountType: AccountType;
    phone?: string | null;
    dateOfBirth?: string | null;
  }
}
