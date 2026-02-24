import Script from "next/script";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";

interface SiteSetting {
  gtmId: string;
  updatedAt: string;
}

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    return await apiClient.serverGet<SiteSetting>(API_ROUTES.SETTINGS.GET, {
      revalidate: 3600, // Cache for 1 hour
    });
  } catch {
    return null;
  }
}

export async function GoogleTagManager() {
  const settings = await getSiteSettings();
  const gtmId = settings?.gtmId;

  if (!gtmId) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - head */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

// Noscript fallback for body
export async function GoogleTagManagerNoScript() {
  const settings = await getSiteSettings();
  const gtmId = settings?.gtmId;

  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
