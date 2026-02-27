import { createClient } from "npm:@supabase/supabase-js@2";
import nacl from "npm:tweetnacl@1.0.3";
import bs58 from "npm:bs58@5.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { publicKey, signature, message } = await req.json();

    if (!publicKey || !signature || !message) {
      return new Response(
        JSON.stringify({ error: "Missing publicKey, signature, or message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the message contains a recent timestamp (within 5 minutes)
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (timestampMatch) {
      const msgTimestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      if (Math.abs(now - msgTimestamp) > 5 * 60 * 1000) {
        return new Response(
          JSON.stringify({ error: "Message expired. Please try again." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Use a deterministic email for wallet users
    const walletEmail = `${publicKey.toLowerCase()}@wallet.soldevlabs.app`;
    // Use a deterministic password (not guessable without the wallet signature)
    const walletPassword = `wallet_${publicKey}_${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.slice(-16)}`;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (signInData?.session) {
      // Update wallet address on profile
      await supabaseAdmin
        .from("profiles")
        .update({ wallet_address: publicKey, wallet_connected: true })
        .eq("user_id", signInData.user.id);

      return new Response(
        JSON.stringify({ session: signInData.session, isNewUser: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist — create account
    const shortName = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;

    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: walletEmail,
      password: walletPassword,
      email_confirm: true,
      user_metadata: {
        full_name: shortName,
        wallet_address: publicKey,
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sign in the newly created user
    const { data: newSession, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (newSignInError || !newSession?.session) {
      return new Response(
        JSON.stringify({ error: "Account created but sign-in failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile with wallet info
    await supabaseAdmin
      .from("profiles")
      .update({ wallet_address: publicKey, wallet_connected: true })
      .eq("user_id", newSession.user.id);

    return new Response(
      JSON.stringify({ session: newSession.session, isNewUser: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Wallet auth error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
