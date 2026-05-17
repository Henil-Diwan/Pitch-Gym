import supabase from "./supabase";
import {supabaseUrl} from "./supabase";



export async function LoginApi({},{email,password}) {
     
    const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
    });

    if (error) throw new Error(error.message);

    return data;
}


export async function getCurrentUser() {
  
  const {data: session, error} = await supabase.auth.getSession();
  console.log("fetching in apiauth");  
  if (!session.session) return null;

  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function signup({},{name, email, password}) {
 

  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw new Error(error.message);

    if (data?.user && data.user.identities.length === 0) {
    throw new Error("Email already registered. Please login instead.");
  }

  return data;
}

export async function logout() {
  const {error} = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}


export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/dashboard", // adjust if needed
    },
  });

  if (error) throw new Error(error.message);
  return data;
}


export async function sendResetPasswordEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/reset-password",
  });

  if (error) throw new Error(error.message);
}

/* UPDATE PASSWORD (called on reset page) */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);
  return data;
}