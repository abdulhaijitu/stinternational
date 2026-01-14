-- Create order deletion audit log table
CREATE TABLE public.order_deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  order_data JSONB NOT NULL,
  deleted_by UUID NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.order_deletion_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view deletion logs
CREATE POLICY "Super admins can view deletion logs"
ON public.order_deletion_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Only super admins can insert deletion logs
CREATE POLICY "Super admins can insert deletion logs"
ON public.order_deletion_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_order_deletion_logs_deleted_at ON public.order_deletion_logs(deleted_at DESC);
CREATE INDEX idx_order_deletion_logs_deleted_by ON public.order_deletion_logs(deleted_by);