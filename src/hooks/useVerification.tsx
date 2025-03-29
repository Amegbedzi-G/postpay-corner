
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function useVerification() {
  const { user, updateProfile, addNotification } = useAuth();
  
  const verifyUser = () => {
    if (user && !user.isVerified) {
      updateProfile({ isVerified: true });
      
      // Notify admin when a user gets verified
      if (!user.isAdmin) {
        addNotification({
          userId: "admin1", // Admin's ID
          type: "system",
          title: "User Verified",
          message: `${user.username} has been verified`,
        });
      }
      
      toast.success("Account verified successfully!");
      return true;
    }
    return false;
  };
  
  const isUserVerified = () => {
    return user?.isVerified || false;
  };
  
  const isUserAdmin = () => {
    return user?.isAdmin || false;
  };
  
  return {
    verifyUser,
    isUserVerified,
    isUserAdmin
  };
}
