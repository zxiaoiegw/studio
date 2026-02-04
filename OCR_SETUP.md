# OCR Setup Guide - Google Cloud Vision API

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
   - Click the project dropdown → "New Project"
   - Name it (e.g., "pillpal-ocr")
   - Click "Create"

## Step 2: Enable Vision API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API"
3. Click on it and press **Enable**

## Step 3: Create Service Account & Download Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name**: `pillpal-ocr` (or any name)
   - **Service account ID**: auto-generated
   - Click **Create and Continue**
4. Grant role: Select **Cloud Vision API User**
5. Click **Continue** → **Done**
6. Click on the created service account
7. Go to **Keys** tab → **Add Key** → **Create new key**
8. Choose **JSON** format → **Create**
9. The JSON file will download automatically

## Step 4: Add Credentials to Your Project

You have two options:

### Option A: Base64 Encoded (Recommended for Production)

1. Convert the downloaded JSON file to base64:
   ```bash
   # On Windows PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\your\credentials.json"))
   
   # On Mac/Linux:
   base64 -i path/to/your/credentials.json
   ```

2. Add to your `.env` file:
   ```
   GOOGLE_CLOUD_VISION_CREDENTIALS=<paste_base64_string_here>
   ```

### Option B: File Path (For Local Development Only)

1. Place the JSON file in your project root (or a secure location)
2. Add to your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/credentials.json
   ```

**⚠️ Important**: 
- Never commit the credentials JSON file to git (it's already in `.gitignore`)
- For production (Vercel, etc.), use Option A (base64) and add it as an environment variable in your hosting platform

## Step 5: Test the Feature

1. Start your dev server: `npm run dev`
2. Go to Medications page
3. Click "Scan prescription"
4. Upload a prescription image
5. Click "Scan prescription" button
6. The OCR should extract text and parse medication details

## Troubleshooting

### Error: "Google Cloud Vision credentials not configured"
- Make sure you added `GOOGLE_CLOUD_VISION_CREDENTIALS` or `GOOGLE_APPLICATION_CREDENTIALS` to your `.env` file
- Restart your dev server after adding env vars

### Error: "Failed to process image"
- Check that Vision API is enabled in your Google Cloud project
- Verify the service account has "Cloud Vision API User" role
- Check your Google Cloud billing (free tier: first 1,000 requests/month)

### OCR not extracting correctly
- The parser is basic - it works best with clear, typed prescriptions
- Handwritten prescriptions may need manual correction
- You can enhance the parser in `src/lib/prescription-parser.ts`

## Cost

- **Free tier**: First 1,000 requests per month
- **After free tier**: ~$1.50 per 1,000 requests
- See [Google Cloud Vision API Pricing](https://cloud.google.com/vision/pricing)
