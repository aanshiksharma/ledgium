import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { setUser } from "../../state/slices/userSlice";

function Signup() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError("root", { message: errorData.message });
        return;
      }

      const response = await res.json();
      localStorage.setItem("token", response.token);

      dispatch(setUser(response.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-neutral-950 text-neutral-300">
        <div className="signup-form-container">
          <div className="top flex flex-col items-center gap-6 w-full py-8">
            <div className="logo w-15 h-15 bg-indigo-600 rounded-sm text-neutral-50 text-[40px] font-bold flex items-center justify-center">
              L
            </div>

            <h1 className="text-2xl text-center font-bold">
              Create New Account!
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6 w-full rounded-sm"
            >
              <div className="grid gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">Name</span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    className="input-field"
                    {...register("name", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">Username</span>
                  <input
                    type="text"
                    placeholder="john_doe"
                    autoComplete="username"
                    className="input-field"
                    {...register("username", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.username && (
                    <p className="error-message">{errors.username.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">Email</span>
                  <input
                    type="text"
                    placeholder="johndoe@gmail.com"
                    autoComplete="email"
                    className="input-field"
                    {...register("email", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">Password</span>
                  <input
                    type="password"
                    placeholder="********"
                    autoComplete="password"
                    className="input-field"
                    {...register("password", {
                      required: {
                        value: true,
                        message: "This field is required.",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 transition ease-out duration-200 text-neutral-100 font-bold leading-5 rounded-sm cursor-pointer"
              >
                Signup
              </button>
            </form>
          </div>

          <p className="text-xs">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
