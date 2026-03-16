import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const uploadPrefix = process.env.CLOUDINARY_UPLOAD_PREFIX;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
      ...(uploadPrefix ? { upload_prefix: uploadPrefix } : {}),
    });
    return;
  }

  if (cloudinaryUrl) {
    // CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
    const parsed = new URL(cloudinaryUrl);
    const parsedApiKey = decodeURIComponent(parsed.username);
    const parsedApiSecret = decodeURIComponent(parsed.password);
    const parsedCloudName = parsed.hostname;

    cloudinary.config({
      cloud_name: parsedCloudName,
      api_key: parsedApiKey,
      api_secret: parsedApiSecret,
      secure: true,
      ...(uploadPrefix ? { upload_prefix: uploadPrefix } : {}),
    });
    return;
  }

  throw new Error(
    "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.",
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    configureCloudinary();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON data format" },
        { status: 400 },
      );
    }

    const file = formData.get("image") as File;

    if (!file)
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 },
      );

    // let tags = JSON.parse(formData.get('tags') as string);
    // let agenda = JSON.parse(formData.get('agenda') as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, results) => {
              if (error) return reject(error);
              if (!results?.secure_url) {
                return reject(
                  new Error("Cloudinary upload did not return a URL."),
                );
              }

              resolve({ secure_url: results.secure_url });
            },
          )
          .end(buffer);
      },
    );

    event.image = uploadResult.secure_url;

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 },
    );
  } catch (e) {
    const err = e as { message?: string; http_code?: number; name?: string };

    if (err?.http_code === 403 || err?.name === "UnexpectedResponse") {
      return NextResponse.json(
        {
          message:
            "Cloudinary rejected the upload (403). Check Cloudinary credentials and ensure the API key has upload permission.",
          error: err.message ?? "UnexpectedResponse",
        },
        { status: 502 },
      );
    }

    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 },
    );
  }
}
