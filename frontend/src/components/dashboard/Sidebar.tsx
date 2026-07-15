import {
  
  Home,
  BookOpen,
  PenSquare,
  Grid3x3,
  UserCircle,
  Image as ImageIcon,
  Mic,
  Music,
  Sparkles,
  Video,
  Heart,
  MessageSquare,
  Bell,
  Tag,
  TrendingUp,
  PlusCircle,
  UserPlus,
  Film,
  Lightbulb,
  GraduationCap,
  Settings,
  Moon,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  active?: boolean;
}

const mainNav: NavItem[] = [
  { label: "Bosh sahifa", icon: Home, active: true },
  { label: "Mening hikoyalarim", icon: BookOpen },
  { label: "Yangi hikoya yaratish", icon: PenSquare },
  { label: "Komiks yaratish", icon: Grid3x3 },
  { label: "Personajlar", icon: UserCircle },
  { label: "Rasmlar galereyasi", icon: ImageIcon },
  { label: "Ovozlar", icon: Mic },
  { label: "Musiqa", icon: Music },
  { label: "Jonlantirish", icon: Sparkles },
  { label: "Videolar", icon: Video },
  { label: "Sevimlilar", icon: Heart },
  { label: "Fikrlar va sharhlar", icon: MessageSquare },
  { label: "Bildirishnomalar", icon: Bell },
];

const categoryNav: NavItem[] = [
  { label: "Janrlar", icon: Tag },
  { label: "Trenddagi hikoyalar", icon: TrendingUp },
  { label: "Yangi qo'shilganlar", icon: PlusCircle },
];

const parentNav: NavItem[] = [
  { label: "Farzandim uchun yaratish", icon: UserPlus },
  { label: "Tarbiyaviy animelar", icon: Film },
  { label: "Ota onalar uchun maslahatlar", icon: Lightbulb },
  { label: "Ilmiy va tarbiyaviy kontent", icon: GraduationCap },
];

function NavGroup({ title, items }: { title?: string; items: NavItem[] }) {
  return (
    <div className="mb-1">
      {title && (
        <p className="px-3 pt-5 pb-2 text-[11px] font-semibold tracking-[0.14em] text-white/30">
          {title}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <button
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                  item.active
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={2}
                  className={item.active ? "text-white" : "text-white/40 group-hover:text-violet-300"}
                />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed z-50 top-0 left-0 h-screen w-[260px] shrink-0 overflow-y-auto border-r border-white/5 bg-[#0a071a] px-3 pb-6 transition-transform duration-300 scrollbar-thin
        lg:sticky lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-2 pt-6 pb-2 lg:hidden">
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 px-2 pt-4 pb-6">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 shadow-lg shadow-violet-950/50">
            <Moon size={20} className="text-white/90" fill="currentColor" />
            <Sparkles size={11} className="absolute -top-1 -right-1 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p
              className="truncate bg-gradient-to-r from-violet-200 via-fuchsia-200 to-indigo-200 bg-clip-text text-[15px] font-bold text-transparent"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Xayollar ro'yosi
            </p>
            <p className="truncate text-[10.5px] text-white/35">
              Tasavvuringdagi olamni yarat
            </p>
          </div>
        </div>

        <NavGroup items={mainNav} />
        <NavGroup title="Kategoriyalar" items={categoryNav} />
        <NavGroup title="Ota onalar bo'limi" items={parentNav} />

        <div className="mt-6 border-t border-white/5 pt-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-white/55 hover:bg-white/[0.06] hover:text-white">
            <Settings size={17} className="text-white/40" />
            Sozlamalar
          </button>
        </div>
      </aside>
    </>
  );
}