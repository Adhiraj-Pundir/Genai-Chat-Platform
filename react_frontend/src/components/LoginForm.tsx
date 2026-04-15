import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginFormData } from "../types";
import { loginUser, registerUser } from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      const res = isRegister
        ? await registerUser(data.username, data.password)
        : await loginUser(data.username, data.password);

      if (res.success && res.data) {
        login({
          userId: res.data.userId,
          username: res.data.username,
          token: res.data.token,
        });
      } else {
        setError(res.error || "Something went wrong");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          {...register("username", { required: "Username is required" })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your username"
          autoComplete="username"
        />
        {errors.username && (
          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          {...register("password", {
            required: "Password is required",
            minLength: { value: 4, message: "Minimum 4 characters" },
          })}
          type="password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
      </button>

      <p className="text-center text-sm text-gray-600">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="text-indigo-600 hover:underline font-medium"
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </form>
  );
}
