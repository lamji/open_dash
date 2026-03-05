import { toast } from "sonner";
import { logoutApi } from "./auth-api";

export interface SecurityAlertOptions {
  message: string;
  autoLogout?: boolean;
  redirectTo?: string;
}

export function showSecurityAlert(options: SecurityAlertOptions): void {
  console.log(`Debug flow: showSecurityAlert fired with`, options);
  
  toast.error(options.message, {
    duration: 5000,
    position: "top-center",
  });

  if (options.autoLogout) {
    console.log(`Debug flow: showSecurityAlert triggering auto-logout`);
    
    // Auto-logout after showing alert
    setTimeout(async () => {
      try {
        await logoutApi();
        console.log(`Debug flow: showSecurityAlert logout successful`);
        
        // Redirect to login with error message
        const redirectUrl = options.redirectTo || "/auth/login";
        const errorParam = encodeURIComponent(options.message);
        window.location.href = `${redirectUrl}?error=${errorParam}`;
      } catch (err) {
        console.error(`Debug flow: showSecurityAlert logout error`, err);
        // Force redirect even if logout fails
        window.location.href = options.redirectTo || "/auth/login";
      }
    }, 1000);
  }
}

export function showSuccessAlert(message: string): void {
  console.log(`Debug flow: showSuccessAlert fired with`, { message });
  toast.success(message, {
    duration: 3000,
    position: "top-right",
  });
}

export function showErrorAlert(message: string): void {
  console.log(`Debug flow: showErrorAlert fired with`, { message });
  toast.error(message, {
    duration: 4000,
    position: "top-right",
  });
}

export function showInfoAlert(message: string): void {
  console.log(`Debug flow: showInfoAlert fired with`, { message });
  toast.info(message, {
    duration: 3000,
    position: "top-right",
  });
}

export function detectFKConstraintError(error: string): boolean {
  console.log(`Debug flow: detectFKConstraintError fired with`, { error });
  
  const fkPatterns = [
    /foreign key constraint/i,
    /FK_CONSTRAINT_VIOLATION/i,
    /violates foreign key/i,
    /fkey/i,
  ];
  
  const isFKError = fkPatterns.some((pattern) => pattern.test(error));
  console.log(`Debug flow: detectFKConstraintError result`, { isFKError });
  
  return isFKError;
}
