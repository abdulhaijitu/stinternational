-- Create UX telemetry events table
CREATE TABLE public.ux_telemetry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_action TEXT,
  event_label TEXT,
  event_value TEXT,
  page_url TEXT,
  device_type TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_ux_telemetry_event_type ON public.ux_telemetry_events(event_type);
CREATE INDEX idx_ux_telemetry_event_category ON public.ux_telemetry_events(event_category);
CREATE INDEX idx_ux_telemetry_created_at ON public.ux_telemetry_events(created_at);
CREATE INDEX idx_ux_telemetry_device_type ON public.ux_telemetry_events(device_type);

-- Enable Row Level Security
ALTER TABLE public.ux_telemetry_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (tracking)
CREATE POLICY "Allow public insert for telemetry"
ON public.ux_telemetry_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view telemetry data
CREATE POLICY "Admins can view telemetry"
ON public.ux_telemetry_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete telemetry data
CREATE POLICY "Admins can delete telemetry"
ON public.ux_telemetry_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));