import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    // Staff can upload to any folder, patients can only upload to 'patients' folder (profile photos)
    const isStaff = [
      "SUPER_ADMIN",
      "CLINIC_MANAGER",
      "DOCTOR",
      "RECEPTIONIST",
    ].includes(session.user.role || "");
    const isPatient = session.user.role === "PATIENT";

    if (!isStaff && !isPatient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Patients can only upload to the 'patients' folder
    if (isPatient && folder !== "patients") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .slice(0, 50);
    const filename = `${sanitizedName}-${timestamp}.${extension}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
