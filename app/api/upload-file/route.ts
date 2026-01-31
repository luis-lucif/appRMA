
import { s3Client } from "@/lib/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server"

// Use server-only runtime if possible, or default to nodejs for Buffer support
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, "-")}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${uniqueFilename}`

    return NextResponse.json({ 
        success: true, 
        key: uniqueFilename,
        publicUrl: publicUrl
    })

  } catch (error) {
    console.error("Upload proxy error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
