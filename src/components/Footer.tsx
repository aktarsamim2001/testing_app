"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Zap, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useFrontendMenus } from "@/hooks/useFrontendMenus";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getFrontSettings } from "@/store/slices/frontSettingsSlice";
import { AppDispatch } from "@/store";

const Footer = () => {
  const pathname = usePathname();
  
  // Fetch frontend menus from API
  const { footerMenu } = useFrontendMenus();
  const dispatch = useDispatch<AppDispatch>();
  const frontSettings = useSelector((state: any) => state.frontSettings);
  const settingsData = frontSettings?.data;

  useEffect(() => {
    if (frontSettings.status === 'idle') {
      dispatch(getFrontSettings());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, frontSettings.status]);

  // Don't show this Footer on dashboard pages
  const isDashboardPage = pathname?.startsWith("/admin") || 
                          pathname?.startsWith("/brand") || 
                          (pathname?.startsWith("/creator") && pathname !== "/creators");

  if (isDashboardPage) return null;

  // Dynamic split for footerMenu
  let servicesMenu = [];
  let companyMenu = [];
  if (footerMenu?.items && footerMenu.items.length > 0) {
    servicesMenu = footerMenu.items.filter(item => item.url && item.url.includes('/services'));
    companyMenu = footerMenu.items.filter(item => !(item.url && item.url.includes('/services')));
  }

  return (
    <footer className="bg-card border-t border-border w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-56 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PartnerScale
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {settingsData?.footer_description ? (
                <span dangerouslySetInnerHTML={{ __html: settingsData.footer_description }} />
              ) : (
                "Scaling SaaS companies through strategic partnerships and influencer marketing."
              )}
            </p>
            <div className="flex gap-3">
              {settingsData?.footer_social_icon?.map((icon: any) => (
                <a key={icon.name} href={icon.url} className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" target="_blank" rel="noopener noreferrer">
                  {icon.name === "Linkedin" && <Linkedin className="w-4 h-4" />}
                  {icon.name === "Twitter" && <Twitter className="w-4 h-4" />}
                  {icon.name === "Youtube" && <Youtube className="w-4 h-4" />}
                  {!["Linkedin", "Twitter", "Youtube"].includes(icon.name) && <Zap className="w-4 h-4" />}
                </a>
              ))}
            </div>
          </div>

          {/* Services Menu */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {servicesMenu.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="hover:text-primary transition-colors" target={item.target_set}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Menu */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyMenu.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="hover:text-primary transition-colors" target={item.target_set}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Ready to scale your SaaS?
            </p>
            <a href={`mailto:${settingsData?.email || "hello@partnerscale.com"}`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail className="w-4 h-4" />
              {settingsData?.email || "hello@partnerscale.com"}
            </a>
            {settingsData?.phone && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {settingsData.phone}
              </div>
            )}
            {settingsData?.address && (
              <div className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-8 h-8" />
                <span>{settingsData.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{settingsData?.copy_right ? settingsData.copy_right : `© ${new Date().getFullYear()} PartnerScale. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
