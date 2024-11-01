// app/api/admin/users/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as crypto from "crypto";

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to hash password
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    console.log("Starting user creation process...");

    // Get the current user's session to verify they're an admin
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Session error", details: sessionError },
        { status: 401 }
      );
    }

    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the new user data from the request
    const body = await request.json();
    console.log("Request body:", { ...body, password: "[REDACTED]" });

    // Create user with admin client
    const { data: authData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: body.fullName,
          role: body.role,
        },
      });

    if (createError) {
      console.error("Error creating auth user:", createError);
      return NextResponse.json(
        { error: "Failed to create auth user", details: createError },
        { status: 500 }
      );
    }

    console.log("Auth user created, creating database record...");

    // Create user record in our database
    const { error: insertError } = await supabase.from("users").insert([
      {
        username: body.username,
        email: body.email,
        password_hash: hashPassword(body.password), // Add hashed password
        full_name: body.fullName,
        role: body.role,
        team_id: body.teamId,
        auth_id: authData.user.id,
        is_active: true,
      },
    ]);

    if (insertError) {
      console.error("Error inserting user record:", insertError);
      // Try to clean up auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user record", details: insertError },
        { status: 500 }
      );
    }

    console.log("User created successfully");
    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (error) {
    console.error("Unexpected error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error },
      { status: 500 }
    );
  }
}