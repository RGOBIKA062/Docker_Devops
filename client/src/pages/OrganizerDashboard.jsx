import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  Eye,
  Share2,
  Calendar,
  Target,
  Mail,
  MessageCircle,
  BarChart3,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const statsCards = [
    { label: "Total Reach", value: "12,450", change: "+23%", icon: Eye, color: "text-blue-500" },
    { label: "Active Events", value: "8", change: "+2", icon: Calendar, color: "text-green-500" },
    { label: "Engagement Rate", value: "67%", change: "+12%", icon: TrendingUp, color: "text-primary" },
    { label: "Total Registrations", value: "3,245", change: "+156", icon: Users, color: "text-purple-500" }
  ];
  const targetGroups = [
    { name: "CS Students, Year 3", match: "95%", count: "1,240" },
    { name: "Robotics Enthusiasts", match: "89%", count: "856" },
    { name: "AI/ML Learners", match: "87%", count: "2,103" },
    { name: "Startup Founders", match: "82%", count: "445" }
  ];
  const recentEvents = [
    {
      name: "AI Workshop",
      status: "Live",
      registrations: 245,
      reach: "8,450",
      engagement: "72%"
    },
    {
      name: "Startup Pitch",
      status: "Upcoming",
      registrations: 180,
      reach: "5,200",
      engagement: "65%"
    },
    {
      name: "Internship Fair",
      status: "Planning",
      registrations: 0,
      reach: "0",
      engagement: "0%"
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "mb-8",
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h1", { className: "font-display font-bold text-4xl sm:text-5xl text-foreground mb-2", children: "Organizer Dashboard" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "Manage events and track audience insights" })
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: () => navigate("/create-event"), className: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-6 h-12", children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5 mr-2" }),
              "Create Event"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: statsCards.map((stat, index) => /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.1 },
          children: /* @__PURE__ */ jsxs(Card, { className: "p-6 border-border rounded-2xl hover:shadow-lg transition-shadow", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-xl bg-orange-light flex items-center justify-center ${stat.color}`, children: /* @__PURE__ */ jsx(stat.icon, { className: "w-6 h-6" }) }),
              /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-700 hover:bg-green-100", children: stat.change })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-3xl font-bold text-foreground mb-1", children: stat.value }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: stat.label })
          ] })
        },
        stat.label
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-8 mb-8", children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            className: "lg:col-span-2",
            children: /* @__PURE__ */ jsxs(Card, { className: "p-6 border-border rounded-3xl", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(BarChart3, { className: "w-5 h-5 text-primary" }) }),
                /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-foreground", children: "Audience Insights" })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "h-64 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center border border-border mb-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx(TrendingUp, { className: "w-16 h-16 text-primary mx-auto mb-3" }),
                /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-foreground", children: "Reach trending upward" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "+23% increase this month" })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-center p-4 bg-orange-light rounded-xl", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-primary mb-1", children: "8.2K" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Impressions" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center p-4 bg-orange-light rounded-xl", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-primary mb-1", children: "3.4K" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Clicks" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center p-4 bg-orange-light rounded-xl", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-primary mb-1", children: "1.2K" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Shares" })
                ] })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            children: /* @__PURE__ */ jsxs(Card, { className: "p-6 border-border rounded-3xl h-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Target, { className: "w-5 h-5 text-primary" }) }),
                /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-foreground", children: "Smart Targeting" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-4", children: targetGroups.map((group, index) => /* @__PURE__ */ jsxs("div", { className: "p-4 bg-orange-light rounded-xl", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm text-foreground", children: group.name }),
                  /* @__PURE__ */ jsx(Badge, { className: "bg-primary text-primary-foreground", children: group.match })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  group.count,
                  " potential attendees"
                ] })
              ] }, index)) }),
              /* @__PURE__ */ jsxs(Button, { className: "w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl", children: [
                /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4 mr-2" }),
                "Promote to Groups"
              ] })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          children: /* @__PURE__ */ jsxs(Card, { className: "p-6 border-border rounded-3xl", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-foreground mb-6", children: "Your Events" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: recentEvents.map((event, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-light rounded-xl hover:bg-primary/10 transition-colors",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-3 sm:mb-0", children: [
                    /* @__PURE__ */ jsx(Calendar, { className: "w-8 h-8 text-primary" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground", children: event.name }),
                      /* @__PURE__ */ jsx(
                        Badge,
                        {
                          variant: event.status === "Live" ? "default" : "secondary",
                          className: event.status === "Live" ? "bg-green-500" : "",
                          children: event.status
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-sm", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Registrations" }),
                      /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground", children: event.registrations })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Reach" }),
                      /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground", children: event.reach })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Engagement" }),
                      /* @__PURE__ */ jsx("p", { className: "font-bold text-primary", children: event.engagement })
                    ] })
                  ] })
                ]
              },
              index
            )) })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "mt-8",
          children: /* @__PURE__ */ jsxs(Card, { className: "p-6 border-border rounded-3xl bg-gradient-to-r from-primary/5 to-primary/10", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display font-bold text-xl text-foreground mb-4", children: "Promotion Templates" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Ready-to-use templates for WhatsApp, Email, and Social Media" }),
            /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "h-auto py-4 flex-col gap-2 rounded-xl border-border hover:border-primary hover:bg-background", children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "w-6 h-6 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "WhatsApp" })
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "h-auto py-4 flex-col gap-2 rounded-xl border-border hover:border-primary hover:bg-background", children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-6 h-6 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Email" })
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "h-auto py-4 flex-col gap-2 rounded-xl border-border hover:border-primary hover:bg-background", children: [
                /* @__PURE__ */ jsx(Share2, { className: "w-6 h-6 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Social Media" })
              ] })
            ] })
          ] })
        }
      )
    ] })
  ] });
};
var OrganizerDashboard_default = OrganizerDashboard;
export {
  OrganizerDashboard_default as default
};
