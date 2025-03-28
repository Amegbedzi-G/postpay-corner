
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { MessageProvider } from "./context/MessageContext";
import { WalletProvider } from "./context/WalletContext";

import { Layout } from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import WalletPage from "./pages/WalletPage";
import MessagesPage from "./pages/MessagesPage";
import ConversationPage from "./pages/ConversationPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import AddPostPage from "./pages/AddPostPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <AuthProvider>
          <PostProvider>
            <MessageProvider>
              <SubscriptionProvider>
                <WalletProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="post/:id" element={<PostDetailPage />} />
                        <Route path="wallet" element={<WalletPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="messages/:id" element={<ConversationPage />} />
                        <Route path="subscribe" element={<SubscriptionPage />} />
                        <Route path="add-post" element={<AddPostPage />} />
                        <Route path="admin" element={<AdminDashboardPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </WalletProvider>
              </SubscriptionProvider>
            </MessageProvider>
          </PostProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
