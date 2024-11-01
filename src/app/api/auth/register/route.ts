// app/api/auth/register/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";
import type { Database } from "@/types/database";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["SCORER", "TEAM_MANAGER"]),
  teamId: z.number().nullable(),
  contactNumber: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedFields = registerSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      );
    }

    const { username, email, password, fullName, role, teamId, contactNumber } =
      validatedFields.data;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user record in our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          full_name: fullName,
          role,
          team_id: teamId,
          contact_number: contactNumber,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (userError) {
      // Rollback auth user creation if user record creation fails
      await supabase.auth.admin.deleteUser(authData.user!.id);
      return NextResponse.json(
        { error: "Failed to create user record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Registration successful. Please check your email for verification.",
      user: userData,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
