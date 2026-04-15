import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <span className="text-xl font-bold tracking-tight">Genai-Chat-Platform</span>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-indigo-200">
              Signed in as{" "}
              <span className="font-semibold text-white">{user.username}</span>
            </span>
            <button
              onClick={logout}
              className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1.5 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
