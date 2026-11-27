import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "./features/auth/LoginPage";
import { OnboardingPage } from "./features/auth/OnboardingPage";
import { RequireAuthStatus } from "./features/auth/RequireAuthStatus";
import { ChannelPage } from "./features/channel/ChannelPage";
import { ServerIndexPage } from "./features/channel/ServerIndexPage";
import { HomePage } from "./features/home/HomePage";
import { MainLayout } from "./features/layout/MainLayout";
import { paths } from "./routes";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RequireAuthStatus status="loggedOut">
            <LoginPage />
          </RequireAuthStatus>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuthStatus status="onboarding">
            <OnboardingPage />
          </RequireAuthStatus>
        }
      />
      {/* Everything else needs a connected client. The layout reads the IDs from the URL. */}
      <Route
        element={
          <RequireAuthStatus status="ready">
            <MainLayout />
          </RequireAuthStatus>
        }
      >
        <Route path="/channels/@me" element={<HomePage />} />
        <Route path="/channels/@me/:channelId" element={<ChannelPage />} />
        <Route path="/servers/:serverId" element={<ServerIndexPage />} />
        <Route path="/servers/:serverId/:channelId" element={<ChannelPage />} />
        <Route path="*" element={<Navigate to={paths.home()} replace />} />
      </Route>
    </Routes>
  );
}
