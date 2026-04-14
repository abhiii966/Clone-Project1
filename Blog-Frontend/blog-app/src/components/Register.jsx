import {
  divider,
  errorClass,
  formCard,
  formGroup,
  formTitle,
  inputClass,
  labelClass,
  pageBackground,
  submitBtn,
  mutedText,
} from "../styles/common";
import { useForm } from "react-hook-form";
import { NavLink,useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";


function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview,setPreview]=useState(null)
  const navigate = useNavigate();
  const { login } = useAuth((state) => state);

  //When user registration submitted
  const onUserRegister = async (userObj) => {
    console.log(userObj);
    //file+userObj -> FormData
    //create FormData obj
    const formData=new FormData()
    //add all user properties and files to this formData object
    formData.append("firstName",userObj.firstName)
    formData.append("lastName",userObj.lastName)
    formData.append("email",userObj.email)
    formData.append("password",userObj.password)
    formData.append("role", userObj.role)
    //Append if image exists
    if(userObj.profileImageUrl?.[0]){
      formData.append("profileImageUrl",userObj.profileImageUrl[0]);
    }

    try {
      //start loading
      setLoading(true);
      //make http post req to create user in backend (and deal with loading and error states accordingly)
      const res = await axios.post("https://two4eg105j32-project1.onrender.com/common-api/users", formData,{withCredentials:true});
      //auto login and navigate to home on successful registration
      if(res.status===201){
        await login({ email: userObj.email, password: userObj.password });
        navigate("/")
      }
    } catch (err) {
      console.log("err in registration", err);
      // Extract error message from various possible formats
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.response?.data ||
        "Registration failed";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className={formCard}>
        <h2 className={formTitle}>Create an Account</h2>

        {/* API Error */}
        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>
          {/* ROLE */}
          <div className="mb-5">
            <p className={labelClass}>Register as</p>

            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="USER"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm">User</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="AUTHOR"
                  {...register("role", {
                    required: "Please select a role",
                  })}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm">Author</span>
              </label>
            </div>

            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div className={divider} />

          {/* NAME */}
          <div className="sm:flex gap-4 mb-4">
            <div className="flex-1">
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                className={inputClass}
                placeholder="First name"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "At least 2 characters required",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max 30 characters allowed",
                  },
                  validate: (v) => v.trim().length > 0 || "Cannot be empty",
                })}
              />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>

            <div className="flex-1">
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Last name"
                {...register("lastName", {
                  maxLength: {
                    value: 30,
                    message: "Max 30 characters allowed",
                  },
                })}
              />
              {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
            </div>
          </div>

          {/* EMAIL */}
          <div className={formGroup}>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                required: [true, "Email is required"],
              })}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div className={formGroup}>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Min. 8 characters"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {/* PROFILE IMAGE */}
          <div className={formGroup}>
            <label className={labelClass}>Profile Image</label>

            <input type="file" 
            accept="image/png, image/jpeg" className={inputClass}
            {...register("profileImageUrl",{
              validate:{
                fileType:(files)=>{
                  if(!files?.[0]) return true;
                  return ["image/png", "image/jpeg"].includes(files[0].type) || "Only JPEG/PNG Files allowed to upload"
                },
                fileSize:(files)=>{
                  if(!files?.[0]) return true;
                  return files[0].size<= 1 * 1024 * 1024 || "Max size 1MB"
                }
              }
            })}
            onChange={(event)=>{
              let file=event.target.files[0]
              if(file){
                setPreview(URL.createObjectURL(file))
              }
            }}
             />

            {errors.profileImageUrl && <p className={errorClass}>{errors.profileImageUrl.message}</p>}

            {/* image preview */}
            {
              preview && <div className="mt-3">
                <img 
                src={preview} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
                />
              </div>
            }

          </div>

          {/* SUBMIT */}
          <button type="submit" className={submitBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* FOOTER */}
        <p className={`${mutedText} text-center mt-5`}>
          Already have an account?{" "}
          <NavLink to="/login" className="text-[#0066cc] font-medium">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
