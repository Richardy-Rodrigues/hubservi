
-- Enum types
CREATE TYPE public.user_type AS ENUM ('client', 'provider');
CREATE TYPE public.price_type AS ENUM ('fixed', 'hourly', 'negotiable');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'completed', 'rejected', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  user_type public.user_type NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_min NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_max NUMERIC(10,2) DEFAULT NULL,
  price_type public.price_type NOT NULL DEFAULT 'fixed',
  location TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Providers can view own services" ON public.services FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can insert own services" ON public.services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own services" ON public.services FOR UPDATE USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own services" ON public.services FOR DELETE USING (auth.uid() = provider_id);

CREATE INDEX idx_services_provider ON public.services(provider_id);
CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_title ON public.services USING gin(to_tsvector('portuguese', title));

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.booking_status NOT NULL DEFAULT 'pending',
  message TEXT DEFAULT '',
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Providers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Providers can update booking status" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_service ON public.bookings(service_id);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, client_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = client_id);

CREATE INDEX idx_reviews_service ON public.reviews(service_id);
CREATE INDEX idx_reviews_client ON public.reviews(client_id);

-- Service stats view
CREATE OR REPLACE VIEW public.service_stats AS
SELECT
  s.id AS service_id,
  COUNT(r.id)::INTEGER AS review_count,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,2) AS average_rating
FROM public.services s
LEFT JOIN public.reviews r ON r.service_id = s.id
GROUP BY s.id;

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'client')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.categories (name, description, icon) VALUES
  ('Limpeza', 'Serviços de limpeza residencial e comercial', 'sparkles'),
  ('Reformas', 'Reformas, reparos e manutenção', 'hammer'),
  ('Tecnologia', 'Suporte técnico, desenvolvimento e TI', 'monitor'),
  ('Educação', 'Aulas particulares e cursos', 'graduation-cap'),
  ('Saúde', 'Serviços de saúde e bem-estar', 'heart-pulse'),
  ('Beleza', 'Cabeleireiro, manicure e estética', 'scissors'),
  ('Transporte', 'Mudanças, fretes e entregas', 'truck'),
  ('Eventos', 'Organização e produção de eventos', 'party-popper'),
  ('Jurídico', 'Consultoria e assessoria jurídica', 'scale'),
  ('Contabilidade', 'Serviços contábeis e financeiros', 'calculator');

-- Booking status transition validation
CREATE OR REPLACE FUNCTION public.validate_booking_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN RETURN NEW;
  ELSIF OLD.status = 'accepted' AND NEW.status IN ('completed', 'cancelled') THEN RETURN NEW;
  ELSE RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
END;
$$;

CREATE TRIGGER validate_booking_status
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_status_transition();
