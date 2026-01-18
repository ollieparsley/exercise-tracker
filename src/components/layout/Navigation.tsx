import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/log", label: "Log", icon: "✏️" },
  { to: "/history", label: "History", icon: "📅" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-mint border-t border-navy/20 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center
              min-h-[56px] py-2
              text-xs transition-colors
              ${isActive ? "text-blue" : "text-navy/60 hover:text-navy"}
            `}
          >
            {({ isActive }) => (
              <>
                <span className="text-lg mb-0.5">{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
