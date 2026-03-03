import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SLUG_REGEX = /^[a-z0-9-]{2,50}$/;

function createAnonClient() {
  // Minimal client with no cookie handling — this is a stateless redirect route
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const fallbackUrl = new URL("/", request.url);

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  const supabase = createAnonClient();

  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id, target_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!qrCode) {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  // Log scan fire-and-forget (don't await — don't delay the redirect)
  const userAgent = request.headers.get("user-agent") ?? null;
  const referrer = request.headers.get("referer") ?? null;
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() ?? null;

  supabase
    .from("qr_scans")
    .insert({
      qr_code_id: qrCode.id,
      user_agent: userAgent,
      referrer: referrer,
      ip_address: ipAddress,
    })
    .then(({ error }) => {
      if (error) {
        console.error("Failed to log QR scan:", error.message);
      }
    });

  return NextResponse.redirect(qrCode.target_url, 302);
}
