import {
  BarChart3,
  BellPlus,
  BellRing,
  Briefcase,
  CalendarClock,
  Cookie as CookieIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  MailCheck,
  MapPin,
  Menu,
  Newspaper,
  PanelBottom,
  PencilRuler,
  Quote,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Shuffle,
  Type,
  Users,
  type LucideIcon
} from "lucide-react";
import type { Role } from "@prisma/client";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavSection {
  title: string | null;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: null,
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "HR", "MARKETING", "EDITOR"]
      }
    ]
  },
  {
    title: "Anfragen",
    items: [
      { href: "/admin/anfragen", label: "Transportanfragen", icon: Inbox, roles: ["SUPER_ADMIN", "MARKETING"] },
      { href: "/admin/kontaktanfragen", label: "Kontaktanfragen", icon: Mail, roles: ["SUPER_ADMIN", "MARKETING"] }
    ]
  },
  {
    title: "Recruiting",
    items: [
      { href: "/admin/bewerbungen", label: "Bewerbungen", icon: Users, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/stellen", label: "Stellenanzeigen", icon: Briefcase, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/termine", label: "Termine", icon: CalendarClock, roles: ["SUPER_ADMIN", "HR"] },
      { href: "/admin/benachrichtigungen", label: "Benachrichtigungen", icon: BellRing, roles: ["SUPER_ADMIN", "HR", "MARKETING"] },
      { href: "/admin/job-alerts", label: "Job-Benachrichtigungen", icon: BellPlus, roles: ["SUPER_ADMIN", "HR", "MARKETING"] },
      { href: "/admin/kpi", label: "Auswertungen", icon: BarChart3, roles: ["SUPER_ADMIN", "HR", "MARKETING"] }
    ]
  },
  {
    title: "Inhalte",
    items: [
      { href: "/admin/seiten", label: "Seiten-Editor", icon: PencilRuler, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/artikel", label: "Wissenszentrum", icon: Newspaper, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/einsatzorte", label: "Einsatzorte", icon: MapPin, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/texte", label: "Website-Texte", icon: Type, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/email-vorlagen", label: "E-Mail-Vorlagen", icon: MailCheck, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/seo", label: "SEO", icon: Search, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/menue", label: "Menü / Navigation", icon: Menu, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/fusszeile", label: "Fußzeile", icon: PanelBottom, roles: ["SUPER_ADMIN", "MARKETING", "EDITOR"] },
      { href: "/admin/redirects", label: "Weiterleitungen", icon: Shuffle, roles: ["SUPER_ADMIN", "MARKETING"] }
    ]
  },
  {
    title: "System",
    items: [
      { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings, roles: ["SUPER_ADMIN"] },
      { href: "/admin/consent", label: "Einwilligungen", icon: CookieIcon, roles: ["SUPER_ADMIN"] },
      { href: "/admin/audit", label: "Protokoll", icon: ScrollText, roles: ["SUPER_ADMIN"] },
      { href: "/admin/system", label: "System", icon: ShieldCheck, roles: ["SUPER_ADMIN"] }
    ]
  }
];

export function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function visibleSections(role: Role): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role))
    }))
    .filter((section) => section.items.length > 0);
}
