import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Stories from './pages/Stories';
import StoryCreate from './pages/StoryCreate';
import StoryView from './pages/StoryView';
import Gallery from './pages/Gallery';
import Favorites from './pages/Favorites';
import Characters from './pages/Characters';
import ComicCreate from './pages/ComicCreate';
import Drawing from './pages/Drawing';
import VideoCreate from './pages/VideoCreate';
import VoiceStudio from './pages/VoiceStudio';
import Music from './pages/Music';
import Genres from './pages/Genres';
import Parents from './pages/Parents';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Asosiy */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Foydalanuvchi */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/favorites" element={<Favorites />} />

        {/* Hikoyalar */}
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryView />} />
        <Route path="/stories/create" element={<StoryCreate />} />

        {/* Ijod */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/comics/create" element={<ComicCreate />} />
        <Route path="/drawing" element={<Drawing />} />
        <Route path="/video/create" element={<VideoCreate />} />
        <Route path="/voice" element={<VoiceStudio />} />
        <Route path="/music" element={<Music />} />

        {/* Boshqalar */}
        <Route path="/genres" element={<Genres />} />
        <Route path="/parents" element={<Parents />} />
      </Routes>
    </BrowserRouter>
  );
}