
import { useAuth } from "@/context/AuthContext";

export function useVerification() {
  const { user, updateProfile } = useAuth();
  
  const verifyUser = () => {
    if (user && !user.isVerified) {
      updateProfile({ isVerified: true });
      return true;
    }
    return false;
  };
  
  const isUserVerified = () => {
    return user?.isVerified || false;
  };
  
  return {
    verifyUser,
    isUserVerified
  };
}
