// app/api/auth/login/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";
import { Database } from "@/types/database";

// Validation schema untuk request body
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedFields = loginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: validatedFields.error.issues },
        { status: 400 }
      );
    }

    const { username, password } = validatedFields.data;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if user exists and get their details
    const { data: userExists, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (userError || !userExists) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify if user is active
    if (!userExists.is_active) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact administrator." },
        { status: 403 }
      );
    }

    // Since we're using Supabase Auth, we'll sign in with email
    // You might need to adjust this based on your auth strategy
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: userExists.email!,
        password: password,
      });

    if (authError) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("user_id", userExists.user_id);

    if (updateError) {
      console.error("Error updating last login:", updateError);
    }

    // Get user permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("role", userExists.role)
      .single();

    if (permissionsError) {
      console.error("Error fetching permissions:", permissionsError);
    }

    // Return user data with permissions
    return NextResponse.json({
      user: {
        id: userExists.user_id,
        username: userExists.username,
        fullName: userExists.full_name,
        role: userExists.role,
        teamId: userExists.team_id,
      },
      permissions: permissions ?? null,
      session: authData.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: Request) {
  return NextResponse.json({}, { status: 200 });
}
