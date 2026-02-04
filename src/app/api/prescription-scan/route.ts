import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize the Vision API client
// Credentials will be read from GOOGLE_CLOUD_VISION_CREDENTIALS env var (base64 JSON)
// or GOOGLE_APPLICATION_CREDENTIALS (file path)
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient() {
  if (visionClient) return visionClient;

  console.log('GOOGLE_CLOUD_VISION_CREDENTIALS exists:', !!process.env.GOOGLE_CLOUD_VISION_CREDENTIALS);
  console.log('GOOGLE_APPLICATION_CREDENTIALS exists:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
  

  try {
    // Prefer base64 (for production hosting - Vercel, etc.)
    if (process.env.GOOGLE_CLOUD_VISION_CREDENTIALS) {
      const credentialsJson = Buffer.from(
        process.env.GOOGLE_CLOUD_VISION_CREDENTIALS,
        'base64'
      ).toString('utf-8');
      const credentials = JSON.parse(credentialsJson);
      visionClient = new ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id,
      });
      return visionClient;
    }

    // Fallback: file path (for local dev)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      visionClient = new ImageAnnotatorClient();
      return visionClient;
    }

    throw new Error('Google Cloud Vision credentials not configured. Set GOOGLE_CLOUD_VISION_CREDENTIALS (base64) or GOOGLE_APPLICATION_CREDENTIALS (file path).');
  } catch (error) {
    console.error('Failed to initialize Vision API client:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Please use JPG, PNG, or PDF.` },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB for Vision API)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer - read as raw binary to avoid decoder issues
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate buffer is not empty
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'File appears to be empty' },
        { status: 400 }
      );
    }

    // Perform OCR
    const client = getVisionClient();
    
    try {
      // Convert to Uint8Array for Vision API (more reliable than Buffer for some formats)
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const [result] = await client.textDetection({
        image: { content: uint8Array },
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        return NextResponse.json(
          { error: 'No text detected in image. Please ensure the image is clear and contains readable text.' },
          { status: 400 }
        );
      }

      // The first annotation contains all detected text
      const fullText = detections[0].description || '';

      return NextResponse.json({
        text: fullText,
        // Include individual word annotations for better parsing
        annotations: detections.slice(1).map((d) => ({
          text: d.description,
          boundingBox: d.boundingPoly?.vertices,
        })),
      });
    } catch (visionError: any) {
      // Handle Vision API specific errors
      console.error('Vision API error:', visionError);
      
      // Check for specific decoder errors
      if (visionError.message?.includes('DECODER') || visionError.message?.includes('unsupported')) {
        return NextResponse.json(
          { error: 'Unable to process this image format. Please try converting to JPG or PNG format.' },
          { status: 400 }
        );
      }
      
      // Re-throw to be caught by outer catch
      throw visionError;
    }
  } catch (error) {
    console.error('OCR error:', error);
    
    // Extract more detailed error message
    let message = 'Failed to process image';
    if (error instanceof Error) {
      message = error.message;
      
      // Provide user-friendly error messages
      if (message.includes('DECODER') || message.includes('unsupported')) {
        message = 'Image format not supported. Please use JPG, PNG, or PDF format.';
      } else if (message.includes('credentials')) {
        message = 'Google Cloud Vision API credentials not configured properly.';
      } else if (message.includes('permission') || message.includes('403')) {
        message = 'Permission denied. Please check your Google Cloud Vision API setup.';
      }
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
