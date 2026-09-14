-- =====================================================================
-- LOST & FOUND SCHOOL PLATFORM - DATABASE SCHEMA
-- PostgreSQL / Supabase Schema with RLS and Security Hardening
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE found_item_status AS ENUM (
        'AVAILABLE',
        'CLAIM_PENDING',
        'CLAIM_APPROVED',
        'RETURN_INFO_PENDING',
        'READY_FOR_PICKUP',
        'RETURNED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lost_report_status AS ENUM ('AVAILABLE', 'RESOLVED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE claim_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SCHOOLS TABLE (Multi-school Architecture)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    join_code VARCHAR(32) NOT NULL UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(32) DEFAULT '#2563EB',
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SCHOOL_MEMBERS TABLE (User-School Relationship)
CREATE TABLE IF NOT EXISTS public.school_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_school_user UNIQUE(school_id, user_id)
);

-- 6. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ITEM_TYPES TABLE
CREATE TABLE IF NOT EXISTS public.item_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_category_item_type UNIQUE(category_id, name)
);

-- 8. FOUND_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    item_type_id UUID NOT NULL REFERENCES public.item_types(id),
    color TEXT NOT NULL,
    brand TEXT,
    description TEXT NOT NULL,
    photo_url TEXT,
    location_found TEXT NOT NULL,
    date_found DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (
        status IN ('AVAILABLE', 'CLAIM_PENDING', 'CLAIM_APPROVED', 'RETURN_INFO_PENDING', 'READY_FOR_PICKUP', 'RETURNED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LOST_REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.lost_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    item_type_id UUID NOT NULL REFERENCES public.item_types(id),
    color TEXT NOT NULL,
    brand TEXT,
    description TEXT NOT NULL,
    photo_url TEXT,
    last_known_location TEXT NOT NULL,
    date_lost DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (
        status IN ('AVAILABLE', 'RESOLVED', 'CANCELLED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_answer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
    ),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. RETURN_INFORMATION TABLE (Strict Security Table)
CREATE TABLE IF NOT EXISTS public.return_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL UNIQUE REFERENCES public.claims(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TEXT NOT NULL,
    contact_method TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_item_id UUID REFERENCES public.found_items(id) ON DELETE SET NULL,
    related_claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_found_items_school ON public.found_items(school_id);
CREATE INDEX IF NOT EXISTS idx_found_items_status ON public.found_items(status);
CREATE INDEX IF NOT EXISTS idx_found_items_category ON public.found_items(category_id);
CREATE INDEX IF NOT EXISTS idx_found_items_item_type ON public.found_items(item_type_id);
CREATE INDEX IF NOT EXISTS idx_found_items_posted_by ON public.found_items(posted_by);
CREATE INDEX IF NOT EXISTS idx_found_items_created_at ON public.found_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lost_reports_school ON public.lost_reports(school_id);
CREATE INDEX IF NOT EXISTS idx_lost_reports_status ON public.lost_reports(status);
CREATE INDEX IF NOT EXISTS idx_lost_reports_reported_by ON public.lost_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_lost_reports_created_at ON public.lost_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claims_item ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

CREATE INDEX IF NOT EXISTS idx_school_members_user ON public.school_members(user_id);
CREATE INDEX IF NOT EXISTS idx_school_members_school ON public.school_members(school_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.audit_logs(school_id, created_at DESC);

-- =====================================================================
-- HELPER FUNCTIONS FOR RLS & TRIGGERS
-- =====================================================================

-- Auto-create profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url, role, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(new.raw_user_meta_data->>'role', 'STUDENT'),
        'ACTIVE'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function: Is user member of school?
CREATE OR REPLACE FUNCTION public.is_member_of_school(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.school_members
        WHERE user_id = p_user_id
          AND school_id = p_school_id
          AND status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Is user admin of school?
CREATE OR REPLACE FUNCTION public.is_school_admin(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.school_members
        WHERE user_id = p_user_id
          AND school_id = p_school_id
          AND role = 'ADMIN'
          AND status = 'ACTIVE'
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
          AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. SCHOOLS POLICIES
CREATE POLICY "Public or authenticated users can view schools to join"
    ON public.schools FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Only admins can update school settings"
    ON public.schools FOR UPDATE
    TO authenticated
    USING (public.is_school_admin(auth.uid(), id))
    WITH CHECK (public.is_school_admin(auth.uid(), id));

-- 3. SCHOOL_MEMBERS POLICIES
CREATE POLICY "Users can view members of schools they belong to"
    ON public.school_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        public.is_member_of_school(auth.uid(), school_id)
    );

CREATE POLICY "Users can join a school"
    ON public.school_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "School Admins can manage school members"
    ON public.school_members FOR ALL
    TO authenticated
    USING (public.is_school_admin(auth.uid(), school_id))
    WITH CHECK (public.is_school_admin(auth.uid(), school_id));

-- 4. CATEGORIES & ITEM_TYPES POLICIES (Reference Data)
CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Item types are readable by everyone"
    ON public.item_types FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Admins can manage item types"
    ON public.item_types FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 5. FOUND_ITEMS POLICIES (Strict School Isolation)
CREATE POLICY "Students and Admins can view found items from their own school"
    ON public.found_items FOR SELECT
    TO authenticated
    USING (public.is_member_of_school(auth.uid(), school_id));

CREATE POLICY "Students can post found items in their school"
    ON public.found_items FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = posted_by AND
        public.is_member_of_school(auth.uid(), school_id)
    );

CREATE POLICY "Poster or Admin can update found items"
    ON public.found_items FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = posted_by OR
        public.is_school_admin(auth.uid(), school_id)
    );

CREATE POLICY "Admins can delete found items"
    ON public.found_items FOR DELETE
    TO authenticated
    USING (public.is_school_admin(auth.uid(), school_id));

-- 6. LOST_REPORTS POLICIES (Strict School Isolation)
CREATE POLICY "Students and Admins can view lost reports from their own school"
    ON public.lost_reports FOR SELECT
    TO authenticated
    USING (public.is_member_of_school(auth.uid(), school_id));

CREATE POLICY "Students can post lost reports in their school"
    ON public.lost_reports FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = reported_by AND
        public.is_member_of_school(auth.uid(), school_id)
    );

CREATE POLICY "Reporter or Admin can update lost reports"
    ON public.lost_reports FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = reported_by OR
        public.is_school_admin(auth.uid(), school_id)
    );

CREATE POLICY "Reporter or Admin can delete lost reports"
    ON public.lost_reports FOR DELETE
    TO authenticated
    USING (
        auth.uid() = reported_by OR
        public.is_school_admin(auth.uid(), school_id)
    );

-- 7. CLAIMS POLICIES
CREATE POLICY "Claimants, Item Posters, and School Admins can view claims"
    ON public.claims FOR SELECT
    TO authenticated
    USING (
        claimant_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.found_items f
            WHERE f.id = item_id AND (
                f.posted_by = auth.uid() OR
                public.is_school_admin(auth.uid(), f.school_id)
            )
        )
    );

CREATE POLICY "Students can submit a claim for an available found item"
    ON public.claims FOR INSERT
    TO authenticated
    WITH CHECK (
        claimant_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.found_items f
            WHERE f.id = item_id AND public.is_member_of_school(auth.uid(), f.school_id)
        )
    );

CREATE POLICY "Admins can update and review claims"
    ON public.claims FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.found_items f
            WHERE f.id = item_id AND public.is_school_admin(auth.uid(), f.school_id)
        )
    );

-- 8. RETURN_INFORMATION POLICIES (CRITICAL PRIVACY MANDATE)
-- Must ONLY be viewable by:
-- 1) Poster of found item (who fills/coordinates it)
-- 2) Approved claimant of the item (Student B)
-- 3) School Admin
-- Student C (random student) CANNOT VIEW UNDER ANY CIRCUMSTANCES!
CREATE POLICY "Strict Access for Return Information"
    ON public.return_information FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.claims c
            JOIN public.found_items f ON f.id = c.item_id
            WHERE c.id = claim_id
              AND (
                  (c.claimant_id = auth.uid() AND c.status = 'APPROVED') OR
                  f.posted_by = auth.uid() OR
                  public.is_school_admin(auth.uid(), f.school_id)
              )
        )
    );

CREATE POLICY "Authorized Poster or Admin can create return information"
    ON public.return_information FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.claims c
            JOIN public.found_items f ON f.id = c.item_id
            WHERE c.id = claim_id
              AND c.status = 'APPROVED'
              AND (
                  f.posted_by = auth.uid() OR
                  public.is_school_admin(auth.uid(), f.school_id)
              )
        )
    );

CREATE POLICY "Creator or Admin can update return info"
    ON public.return_information FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.claims c
            JOIN public.found_items f ON f.id = c.item_id
            WHERE c.id = claim_id AND public.is_school_admin(auth.uid(), f.school_id)
        )
    );

-- 9. NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can mark their own notifications as read"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 10. AUDIT_LOGS POLICIES
CREATE POLICY "Only School Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_school_admin(auth.uid(), school_id));

CREATE POLICY "Authenticated users and system can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (actor_id = auth.uid());
