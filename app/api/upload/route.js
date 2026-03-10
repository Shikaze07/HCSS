import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: "Cloudinary configuration missing" }, { status: 500 });
        }

        // Build signed upload parameters
        const timestamp = Math.round(Date.now() / 1000);
        const folder = "hcss/services";

        // Create signature: sign params alphabetically, then append secret
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto
            .createHash("sha1")
            .update(paramsToSign)
            .digest("hex");

        // Build form data for Cloudinary
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("api_key", apiKey);
        uploadForm.append("timestamp", String(timestamp));
        uploadForm.append("signature", signature);
        uploadForm.append("folder", folder);

        const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: uploadForm }
        );

        const data = await cloudinaryRes.json();

        if (!cloudinaryRes.ok) {
            console.error("Cloudinary Detailed Error:", JSON.stringify(data, null, 2));
            return NextResponse.json(
                { error: data?.error?.message || "Cloudinary upload failed" },
                { status: cloudinaryRes.status }
            );
        }

        return NextResponse.json({ url: data.secure_url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
