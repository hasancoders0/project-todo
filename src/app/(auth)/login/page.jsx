
import { loginWithUsername } from "@/actions/team-actions";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  const errorMessages = {
    "missing-username": "Please enter your username.",
    "user-not-found": "No user found. Please check your username.",
  };

  const errorMessage =
    typeof error === "string" ? errorMessages[error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <span className="text-lg font-bold">T</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Project Todo
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in with your username
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form action={loginWithUsername} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-center text-xs leading-5 text-gray-500">
            Internal team workspace
          </p>
        </div>
      </div>
    </main>
  );
}
