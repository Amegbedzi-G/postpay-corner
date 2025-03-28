
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { LogOut, ChevronLeft } from "lucide-react";

const SettingsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="max-w-lg mx-auto">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {user.isSubscribed && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Current Plan</span>
                    <span className="text-sm text-premium">
                      {user.subscriptionType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Next Billing</span>
                    <span className="text-sm">
                      {user.subscriptionEndDate
                        ? new Date(user.subscriptionEndDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="privacy">
                <AccordionTrigger>Privacy</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Manage your privacy settings. This feature will be
                      available in future updates.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Privacy Settings
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notifications">
                <AccordionTrigger>Notifications</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Configure your notification preferences. This feature will
                      be available in future updates.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Notification Settings
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="security">
                <AccordionTrigger>Security</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Update your security settings and change password. This
                      feature will be available in future updates.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Security Settings
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
