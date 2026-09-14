-- =====================================================================
-- LOST & FOUND STORAGE CONFIGURATION
-- Supabase Storage Bucket & RLS Policies for Image Uploads
-- =====================================================================

-- 1. Create the storage bucket for lost and found photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-photos',
    'item-photos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Storage RLS Policies
CREATE POLICY "Item photos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'item-photos');

CREATE POLICY "Authenticated users can upload item photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'item-photos' AND
        (storage.extension(name) = 'jpg' OR
         storage.extension(name) = 'jpeg' OR
         storage.extension(name) = 'png' OR
         storage.extension(name) = 'webp')
    );

CREATE POLICY "Users can update or delete their own uploads"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own item photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
