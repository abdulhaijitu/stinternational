// Error Tracking Service
// This service provides a centralized way to log and track errors
// Can be extended to integrate with external services like Sentry, LogRocket, etc.

export interface ErrorContext {
  componentStack?: string;
  userId?: string;
  route?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: "error" | "warning" | "info";
}

class ErrorTrackingService {
  private isInitialized = false;
  private environment: string;
  private appVersion: string;
  
  constructor() {
    this.environment = import.meta.env.MODE || "development";
    this.appVersion = "1.0.0"; // Could be read from package.json or env
  }

  /**
   * Initialize the error tracking service
   * In production, this would initialize Sentry or similar service
   */
  init(options?: { dsn?: string; environment?: string }) {
    if (this.isInitialized) return;
    
    if (options?.environment) {
      this.environment = options.environment;
    }
    
    // Set up global error handlers
    this.setupGlobalHandlers();
    
    this.isInitialized = true;
    console.log(`[ErrorTracking] Initialized for environment: ${this.environment}`);
  }

  /**
   * Set up global error handlers for unhandled errors
   */
  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { metadata: { type: "unhandledRejection" } },
        "error"
      );
    });

    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      if (event.error) {
        this.captureException(
          event.error,
          { 
            metadata: { 
              type: "uncaughtError",
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            } 
          },
          "error"
        );
      }
    });
  }

  /**
   * Capture and report an exception
   */
  captureException(
    error: Error,
    context: ErrorContext = {},
    severity: "error" | "warning" | "info" = "error"
  ): string {
    const report: ErrorReport = {
      error,
      context: {
        ...context,
        timestamp: Date.now(),
        route: window.location.pathname,
      },
      severity,
    };

    // Generate a unique error ID
    const errorId = this.generateErrorId();

    // Log to console in development
    if (this.environment === "development") {
      console.group(`[ErrorTracking] ${severity.toUpperCase()}: ${error.message}`);
      console.error(error);
      console.log("Context:", report.context);
      console.log("Error ID:", errorId);
      console.groupEnd();
    }

    // Send to backend/external service
    this.sendErrorReport(report, errorId);

    return errorId;
  }

  /**
   * Capture a message (non-exception event)
   */
  captureMessage(
    message: string,
    context: ErrorContext = {},
    severity: "error" | "warning" | "info" = "info"
  ): string {
    const error = new Error(message);
    return this.captureException(error, context, severity);
  }

  /**
   * Set user context for error reports
   */
  setUser(userId: string, userData?: Record<string, unknown>) {
    // Store user context for future error reports
    sessionStorage.setItem("errorTracking_userId", userId);
    if (userData) {
      sessionStorage.setItem("errorTracking_userData", JSON.stringify(userData));
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    sessionStorage.removeItem("errorTracking_userId");
    sessionStorage.removeItem("errorTracking_userData");
  }

  /**
   * Add breadcrumb for debugging trail
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
    const breadcrumbs = this.getBreadcrumbs();
    breadcrumbs.push({
      message,
      category,
      data,
      timestamp: Date.now(),
    });
    
    // Keep only last 50 breadcrumbs
    const trimmed = breadcrumbs.slice(-50);
    sessionStorage.setItem("errorTracking_breadcrumbs", JSON.stringify(trimmed));
  }

  /**
   * Get current breadcrumbs
   */
  private getBreadcrumbs(): Array<{
    message: string;
    category: string;
    data?: Record<string, unknown>;
    timestamp: number;
  }> {
    try {
      const stored = sessionStorage.getItem("errorTracking_breadcrumbs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Send error report to backend or external service
   * In production, this would send to Sentry, LogRocket, or custom backend
   */
  private async sendErrorReport(report: ErrorReport, errorId: string) {
    const payload = {
      errorId,
      message: report.error.message,
      stack: report.error.stack,
      severity: report.severity,
      context: report.context,
      environment: this.environment,
      appVersion: this.appVersion,
      userAgent: navigator.userAgent,
      url: window.location.href,
      breadcrumbs: this.getBreadcrumbs(),
      userId: sessionStorage.getItem("errorTracking_userId"),
    };

    // In production, send to your error tracking endpoint
    if (this.environment === "production") {
      try {
        // Example: Send to a backend endpoint
        // await fetch("/api/error-tracking", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });
        
        // For now, just log that we would send this
        console.log("[ErrorTracking] Would send to production:", payload);
      } catch (sendError) {
        // Silently fail - don't create infinite error loops
        console.warn("[ErrorTracking] Failed to send error report:", sendError);
      }
    }
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();

// Initialize on module load
if (typeof window !== "undefined") {
  errorTracking.init();
}

// Convenience function for capturing exceptions
export const captureException = (
  error: Error,
  context?: ErrorContext,
  severity?: "error" | "warning" | "info"
) => errorTracking.captureException(error, context, severity);

// Convenience function for capturing messages
export const captureMessage = (
  message: string,
  context?: ErrorContext,
  severity?: "error" | "warning" | "info"
) => errorTracking.captureMessage(message, context, severity);
