import { create } from "zustand";

const useAppStore = create((set) => ({
  // Auth
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user") || null,

  // setUser : (newName) => { set({user : newName } )} ,

  setToken: (token,username) => {
    if (token) {
      localStorage.setItem("token", token);
      if (username) localStorage.setItem("user", username);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token, user: username || null });
  },
  clearToken: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },

  // Theme
  theme: localStorage.getItem("theme") || "light",
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return { theme: newTheme };
    }),
}));

export default useAppStore;
