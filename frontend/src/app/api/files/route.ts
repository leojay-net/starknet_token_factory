import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log('Uploading file to Pinata:', file.name, file.type, file.size);

    const { cid } = await pinata.upload.public.file(file);
    console.log('File uploaded to IPFS with CID:', cid);

    // Get the public gateway URL
    const url = await pinata.gateways.public.convert(cid);
    console.log('Generated gateway URL:', url);

    // Ensure we return a proper gateway URL that works
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    console.log('Returning gateway URL:', gatewayUrl);

    return NextResponse.json(gatewayUrl, { status: 200 });
  } catch (e) {
    console.error('Error uploading file to Pinata:', e);
    return NextResponse.json(
      { error: "Failed to upload file to IPFS" },
      { status: 500 }
    );
  }
} 