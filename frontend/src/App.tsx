import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/Forgotpassword";
import ChangePasswordPage from "./pages/Changepassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Stories from "./pages/Stories";
import StoryCreate from "./pages/StoryCreate";
import StoryView from "./pages/StoryView";
import Gallery from "./pages/Gallery";
import Favorites from "./pages/Favorites";
import Characters from "./pages/Characters";
import ComicCreate from "./pages/ComicCreate";
import Drawing from "./pages/Drawing";
import VideoCreate from "./pages/VideoCreate";
import VoiceStudio from "./pages/Voice";
import Music from "./pages/Music";
import Parents from "./pages/Parents";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Asosiy */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />

        {/* Foydalanuvchi */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/favorites" element={<Favorites />} />

        {/* Hikoyalar */}
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryView />} />
        <Route path="/storiecreate" element={<StoryCreate />} />

        {/* Ijod */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/comicscreate" element={<ComicCreate />} />
        <Route path="/drawing" element={<Drawing />} />
        <Route path="/videocreate" element={<VideoCreate />} />
        <Route path="/voice" element={<VoiceStudio />} />
        <Route path="/music" element={<Music />} />   
        <Route path="/parents" element={<Parents />} />
      </Routes>
    </BrowserRouter>
  );
}