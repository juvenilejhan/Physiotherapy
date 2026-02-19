import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, send email with reset link here
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store token in database (you could create a PasswordReset model)
      // For now, we'll just log it
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Token expires at: ${resetTokenExpiry}`);

      // TODO: Send email with reset link
      // In production, integrate with email service (SendGrid, SES, etc.)
      // Email body would include: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, you will receive password reset instructions shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
