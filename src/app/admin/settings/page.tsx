import { Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmailSettingsForm } from "@/components/admin/email-settings-form";
import { getEmailSettings } from "@/lib/actions/email-settings";

export default async function SettingsPage() {
  const settings = await getEmailSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Settings className="size-7 text-primary" />
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure email notifications and automated flows.
        </p>
      </div>

      {!settings ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Email settings table not found. Apply migration{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                004_email_settings.sql
              </code>{" "}
              to enable this feature.
            </p>
          </CardContent>
        </Card>
      ) : (
        <EmailSettingsForm settings={settings} />
      )}
    </div>
  );
}
