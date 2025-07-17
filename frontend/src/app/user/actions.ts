"use server";

import { createClient } from "../../../supabase/server";

interface UserProfile {
  id: string;
  name: string;
  full_name: string;
  email: string;
  user_id: string;
  token_identifier: string;
  created_at: string;
}

export const createUserProfile = async (userData: {
  userId: string;
  fullName: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient();

  try {
    const userProfile: UserProfile = {
      id: userData.userId,
      name: userData.fullName,
      full_name: userData.fullName,
      email: userData.email,
      user_id: userData.userId,
      token_identifier: userData.userId,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("users").insert(userProfile);

    if (error) {
      console.error("Error creating user profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in user profile creation:", err);
    return { success: false, error: "Unknown error occurred" };
  }
};

export const getUserProfile = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};