# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image and video uploads in the Canteen feature.

## Why Cloudinary?

- **Free tier**: 25GB storage + 25GB monthly bandwidth
- **No Firebase Storage costs**: Avoid expensive Firebase Storage pricing
- **Built-in optimization**: Automatic image/video optimization and transformations
- **Easy integration**: Simple upload widget that works with Next.js

## Step-by-Step Setup

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click **Sign Up** (it's free!)
3. Complete the registration

### 2. Get Your Cloud Name

1. After logging in, you'll see your **Dashboard**
2. Find your **Cloud Name** (e.g., `dxxxxx`)
3. Copy it - you'll need this for `.env.local`

### 3. Create Upload Preset

An upload preset defines settings for uploads (file types, size limits, etc.)

#### Steps:
1. Go to **Settings** (gear icon) in the top right
2. Click on **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `campus-world-uploads` (or any name you prefer)
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: `campus-world` (optional, for organization)
   - **Allowed formats**: 
     - For images: `jpg,png,gif,webp`
     - For videos: `mp4,mov,avi`
   - **Max file size**: 
     - Images: 10MB
     - Videos: 50MB
6. Click **Save**

### 4. Add to Environment Variables

Create or update `.env.local` in your project root:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=campus-world-uploads
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=campus-world-uploads
```

### 5. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## How It Works

1. User clicks "Upload Image/Video" button in Canteen
2. Cloudinary widget opens
3. User selects file from:
   - Local computer
   - Camera (mobile)
   - URL
4. File uploads directly to Cloudinary
5. Cloudinary returns secure URL
6. URL is saved to Firebase (not the actual file)
7. Posts display media from Cloudinary CDN

## Benefits

- ✅ **Fast loading**: Cloudinary CDN serves optimized files
- ✅ **No storage costs**: Free 25GB storage
- ✅ **Automatic optimization**: Images/videos compressed automatically
- ✅ **Transformations**: Can resize, crop, format images on-the-fly
- ✅ **Mobile support**: Works on all devices

## Widget Customization

The upload widget in [app/canteen/page.tsx](app/canteen/page.tsx) is styled to match the dark theme. You can customize:

- **Theme colors**: Change `styles.palette` in `openCloudinaryWidget`
- **File types**: Modify `clientAllowedFormats`
- **Max size**: Adjust `maxFileSize`
- **Sources**: Enable/disable camera, URL, local uploads

## Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25 credits/month
- **Videos**: 500MB/month

For most campus apps, this is more than enough!

## Troubleshooting

### Widget not loading

**Check:**
```javascript
if (!(window as any).cloudinary) {
  // Widget script not loaded
}
```

**Fix:** Ensure script is loaded in page:
```html
<script
  src="https://widget.cloudinary.com/v2.0/global/all.js"
  type="text/javascript"
  async
/>
```

### Upload fails

1. **Check preset is unsigned**: Go to Settings → Upload → Check preset signing mode
2. **Verify env variables**: Restart dev server after adding `.env.local`
3. **Check browser console**: Look for API key or network errors

### Images not displaying

1. **Check URL format**: Should be `https://res.cloudinary.com/[cloud_name]/image/upload/...`
2. **Verify CORS**: Cloudinary allows all origins by default
3. **Check Firestore**: Ensure `mediaUrl` is saved correctly

## Advanced: Custom Transformations

You can transform images in URLs:

```javascript
// Original
https://res.cloudinary.com/demo/image/upload/sample.jpg

// Resized to 400px width
https://res.cloudinary.com/demo/image/upload/w_400/sample.jpg

// Cropped and rounded
https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,r_max/sample.jpg
```

Add transformations between `/upload/` and the file path!

## Support

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Upload Widget Docs](https://cloudinary.com/documentation/upload_widget)
- [Transformations Guide](https://cloudinary.com/documentation/image_transformations)

---

**That's it!** Your Canteen now has professional media upload capabilities. 🎉
