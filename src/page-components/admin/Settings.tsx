import { useState, useEffect } from "react";
import { Plus, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/settings/FormSection";
import { FormField } from "@/components/settings/FormField";
import { FileUpload } from "@/components/settings/FileUpload";
import { ScriptEditor } from "@/components/settings/ScriptEditor";
import { RichTextEditor } from "@/components/settings/RichTextEditor";
import { SocialIconManager } from "@/components/settings/SocialIconManager";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchSettings, updateSettings } from "@/store/slices/settings";

interface FileData {
  name: string;
  size: number;
  url: string;
}

interface SocialIcon {
  id: number;
  name?: string;
  url: string;
  platform?: string;
  iconUrl?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const settings = useSelector((state: any) => state.settings.data);
  const loading = useSelector((state: any) => state.settings.loading);

  // Local state for form fields
  const [logo, setLogo] = useState<FileData | null>(null);
  const [favicon, setFavicon] = useState<FileData | null>(null);
  const [headScript, setHeadScript] = useState("");
  const [bodyScript, setBodyScript] = useState("");
  const [footerScript, setFooterScript] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [copyright, setCopyright] = useState("");
  const [information, setInformation] = useState("");
  const [address, setAddress] = useState("");
  const [socialIcons, setSocialIcons] = useState<SocialIcon[]>([]);

  // Fetch settings on mount
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Populate local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setLogo(
        settings.logo ? { name: "logo.png", size: 0, url: settings.logo } : null
      );
      setFavicon(
        settings.fav_icon
          ? { name: "favicon.png", size: 0, url: settings.fav_icon }
          : null
      );
      setHeadScript(settings.head_scripts || "");
      setBodyScript(settings.body_scripts || "");
      setFooterScript(settings.footer_scripts || "");
      setPhone(settings.phone || "");
      setEmail(settings.email || "");
      setCopyright(settings.copy_right || "");
      setInformation(settings.footer_description || "");
      setSocialIcons(
        (settings.footer_social_icon || []).map((icon: any, idx: number) => ({
          id: icon.id ?? Date.now() + idx,
          name: icon.name || '',
          url: icon.url || '',
          icon: icon.icon || '',
        }))
      );
    }
  }, [settings]);

  const removeSocialIcon = (id: number) => {
    setSocialIcons(socialIcons.filter((icon) => icon.id !== id));
  };

  const updateSocialIcon = (
    id: number,
    field: "name" | "url" | "platform" | "iconUrl",
    value: string
  ) => {
    setSocialIcons(
      socialIcons.map((icon) =>
        icon.id === id ? { ...icon, [field]: value } : icon
      )
    );
  };

  const addSocialIcon = () => {
    setSocialIcons([
      ...socialIcons,
      { id: Date.now(), name: '', url: '', platform: '', iconUrl: '' },
    ]);
  };

  const handleSave = () => {
    const payload = {
      id: settings?.id || "",
      logo: logo?.url || "",
      fav_icon: favicon?.url || "",
      phone,
      email,
      address,
      head_scripts: headScript,
      body_scripts: bodyScript,
      footer_scripts: footerScript,
      footer_description: information,
      copy_right: copyright,
      footer_social_icon: socialIcons.map(({ name = '', url, iconUrl = '', platform = '' }) => ({
        name,
        url,
        icon: iconUrl || platform || '',
      })),
    };
    dispatch(updateSettings(payload) as any).then(() => {
      dispatch(fetchSettings());
      toast({
        title: "Settings saved",
        description: "Your changes have been updated successfully.",
        variant: 'success',
      });
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8 space-y-10">
              <div className="pt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">
                      Settings
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Manage your application configuration
                    </p>
                  </div>
                </div>
                <div className="flex md:block justify-start md:justify-end">
                  <Button onClick={handleSave} className="gap-2 w-full md:w-auto" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-primary-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Icon Information */}
              <FormSection
                title="Brand Assets"
                description="Upload your logo and favicon for branding across the platform."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label="Logo"
                    file={logo}
                    onUpload={setLogo}
                    onRemove={() => setLogo(null)}
                  />
                  <FileUpload
                    label="Favicon"
                    file={favicon}
                    onUpload={setFavicon}
                    onRemove={() => setFavicon(null)}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Script Configuration */}
              <FormSection
                title="Script Configuration"
                description="Add custom scripts for analytics and tracking."
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ScriptEditor
                    label="Head Scripts"
                    value={headScript}
                    onChange={setHeadScript}
                    placeholder="Add meta tags or head scripts..."
                  />
                  <ScriptEditor
                    label="Body Scripts"
                    value={bodyScript}
                    onChange={setBodyScript}
                    placeholder="Add body scripts..."
                  />
                  <ScriptEditor
                    label="Footer Scripts"
                    value={footerScript}
                    onChange={setFooterScript}
                    placeholder="Add footer scripts..."
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Contact Information */}
              <FormSection
                title="Contact Information"
                description="Provide contact details for customer inquiries."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  <FormField label="Phone" required>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="bg-background w-full"
                    />
                  </FormField>
                  <FormField label="Email" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="bg-background w-full"
                    />
                  </FormField>
                </div>
                <div className="mt-3 w-full">
                  <FormField label="Address" required>
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      className="bg-background w-full"
                    />
                  </FormField>
                </div>
              </FormSection>

              <Separator />

              {/* Social Icons */}
              <FormSection
                title="Social Media"
                description="Add social media links for the footer section."
              >
                <SocialIconManager
                  icons={socialIcons}
                  onAdd={addSocialIcon}
                  onRemove={removeSocialIcon}
                  onChange={updateSocialIcon}
                />
              </FormSection>

              <Separator />

              {/* Footer Section */}
              <FormSection
                title="Footer Content"
              >
                <div className="space-y-6">
                  <FormField label="Copyright" required>
                    <Input
                      value={copyright}
                      onChange={(e) => setCopyright(e.target.value)}
                      placeholder="Enter copyright text"
                      className="bg-background"
                    />
                  </FormField>

                  <FormField label="Information" required>
                    <TiptapEditor
                      value={information}
                      onChange={setInformation}
                    />
                  </FormField>
                </div>
              </FormSection>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminLayout>
  );
}
