import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Bookmark, Share2, ExternalLink, Twitter, Linkedin, Facebook, Copy, MessageSquare } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useUserManager } from "@/hooks/useUserManager";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
const EventCard = ({
  id,
  title = "Untitled Event",
  organizer = "Unknown Organizer",
  description = "No description available",
  date = "TBD",
  time = "TBD",
  location = "TBD",
  tags = [],
  imageUrl = null,
  attendees = 0,
  registrationUrl = null
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const userManager = useUserManager();
  
  // Load initial state from persistent storage
  const [bookmarked, setBookmarked] = React.useState(() => 
    id ? userManager.isInWishlist(id) : false
  );
  const [isReminderSet, setIsReminderSet] = React.useState(() =>
    id ? userManager.hasReminder(id) : false
  );

  const shareFor = React.useCallback((type) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/student?title=${encodeURIComponent(title)}`;
      const text = `${title} — ${date} • ${time} @ ${location} — ${organizer}`;
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);

      switch (type) {
        case "whatsapp": {
          const wa = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
          window.open(wa, "_blank");
          break;
        }
        case "twitter": {
          const tw = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          window.open(tw, "_blank");
          break;
        }
        case "facebook": {
          const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          window.open(fb, "_blank", "noopener,noreferrer");
          break;
        }
        case "linkedin": {
          const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          window.open(li, "_blank");
          break;
        }
        case "copy": {
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(url);
              toast({ title: "Link copied", description: "Event link copied to clipboard." });
            } else {
              const tmp = document.createElement("input");
              document.body.appendChild(tmp);
              tmp.value = url;
              tmp.select();
              document.execCommand("copy");
              document.body.removeChild(tmp);
              toast({ title: "Link copied", description: "Event link copied to clipboard." });
            }
            break;
          }
        case "native": {
          if (navigator?.share) {
            navigator.share({ title, text, url }).catch(() => {});
          } else {
            if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(url);
            toast({ title: "Sharing not available", description: "Link copied to clipboard instead." });
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  }, [title, date, time, location, organizer]);

  const handleBookmark = React.useCallback((e) => {
    e.stopPropagation();
    const newState = !bookmarked;
    setBookmarked(newState);
    
    if (id) {
      if (newState) {
        userManager.addToWishlist(id, { title, organizer, date, time, location, imageUrl });
      } else {
        userManager.removeFromWishlist(id);
      }
    }
    
    toast({
      description: newState ? "Added to wishlist" : "Removed from wishlist",
      className: newState ? "bg-green-50" : "bg-red-50"
    });
  }, [bookmarked, toast, id, userManager, title, organizer, date, time, location, imageUrl]);

  const handleReminder = React.useCallback((e) => {
    e.stopPropagation();
    const newState = !isReminderSet;
    setIsReminderSet(newState);
    
    if (id) {
      if (newState) {
        userManager.addReminder(id, { title, date, time, location });
      } else {
        userManager.removeReminder(id);
      }
    }
    
    toast({
      description: newState ? "Reminder set for this event" : "Reminder removed",
      className: newState ? "bg-blue-50" : "bg-slate-50"
    });
  }, [isReminderSet, toast, id, userManager, title, date, time, location]);

  const handleCardClick = React.useCallback(() => {
    if (id) {
      navigate(`/event/${id}`);
    }
  }, [id, navigate]);

  const handleRegisterClick = React.useCallback((e) => {
    e.stopPropagation();
    if (registrationUrl) {
      window.open(registrationUrl, '_blank');
    } else if (id) {
      navigate(`/event/${id}`);
    }
  }, [registrationUrl, id, navigate]);
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      whileHover: { y: -12, boxShadow: "0 30px 60px rgba(255, 122, 0, 0.25)" },
      onClick: handleCardClick,
      transition: { duration: 0.3, ease: "easeOut" },
      className: "group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col hover:border-primary/50 shadow-md hover:shadow-2xl",
      style: { boxShadow: "0 4px 24px -4px rgba(255, 122, 0, 0.1)" },
      children: [
        imageUrl && /* @__PURE__ */ jsxs("div", { className: "relative w-full bg-gradient-to-br from-slate-50 to-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden", style: { minHeight: "280px", maxHeight: "320px" }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: imageUrl,
              alt: title,
              className: "w-auto h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110",
              loading: "lazy",
              onError: (e) => {
                e.target.style.backgroundColor = "#e2e8f0";
              }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-slate-50/50", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: (Array.isArray(tags) && tags.length > 0) ? tags.map((tag) => /* @__PURE__ */ jsx(
            Badge,
            {
              variant: "secondary",
              className: "bg-orange-100 text-orange-900 hover:bg-primary hover:text-white transition-all duration-200 text-xs font-semibold px-3 py-1",
              children: String(tag)
            },
            String(tag)
          )) : null }),
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2", children: title }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600 mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-orange-500 flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: organizer })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-700 mb-4 line-clamp-2 flex-grow", children: description }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-4 text-xs text-slate-600", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-orange-500 flex-shrink-0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                date,
                " \u2022 ",
                time
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 truncate", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-orange-500 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: location })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-auto", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: handleRegisterClick,
                className: "flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 py-2",
                children: [
                  "Register",
                  /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 ml-2" })
                ]
              }
            ),
            /* Bookmark with tooltip and toggle */
            /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, {
                  size: "icon",
                  variant: "ghost",
                  onClick: handleBookmark,
                  "aria-pressed": bookmarked,
                  className: `rounded-xl border border-border hover:border-primary hover:bg-orange-light transform transition-all duration-150 ${bookmarked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary"}`,
                  children: /* @__PURE__ */ jsx(Bookmark, { className: `w-4 h-4 ${bookmarked ? "text-primary fill-primary" : ""}` })
              }) }), /* tooltip content */ /* @__PURE__ */ jsx(TooltipContent, { sideOffset: 6, children: bookmarked ? "Bookmarked" : "Save" })] }) }),

            /* Reminder button with tooltip */
            /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, {
                  size: "icon",
                  variant: "ghost",
                  onClick: handleReminder,
                  "aria-pressed": isReminderSet,
                  className: `rounded-xl border border-border hover:border-primary hover:bg-blue-light transform transition-all duration-150 ${isReminderSet ? "bg-blue-500/10 text-blue-600" : "text-muted-foreground hover:text-primary"}`,
                  children: /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${isReminderSet ? "fill-blue-600" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) })
              }) }), /* tooltip content */ /* @__PURE__ */ jsx(TooltipContent, { sideOffset: 6, children: isReminderSet ? "Reminder set" : "Set reminder" })] }) }),

            /* Share dropdown with tooltip and better hover */
            /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(Tooltip, { children: [/* TooltipTrigger wraps a single span which contains the dropdown so Radix gets a single child */ /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex", children: [/* Dropdown inside span */ /* @__PURE__ */ jsxs(DropdownMenu, {
                children: [
                  /* Trigger button */ /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, {
                    size: "icon",
                    variant: "ghost",
                    className: "rounded-xl border border-border hover:border-primary hover:bg-orange-light transform transition-all duration-150 hover:scale-105 text-muted-foreground hover:text-primary",
                    "aria-label": "Share",
                    title: "Share",
                    children: /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" })
                  }) }),
                  /* Menu content */ /* @__PURE__ */ jsxs(DropdownMenuContent, { sideOffset: 6, align: "end", className: "w-48", children: [
                    /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Share" }),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("whatsapp"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-emerald-500" }), "WhatsApp"] }) }),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("twitter"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(Twitter, { className: "w-4 h-4 text-sky-500" }), "Twitter"] }) }),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("facebook"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(Facebook, { className: "w-4 h-4 text-blue-600" }), "Facebook"] }) }),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("linkedin"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(Linkedin, { className: "w-4 h-4 text-sky-700" }), "LinkedIn"] }) }),
                    /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("native"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }), "Use device share"] }) }),
                    /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => shareFor("copy"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [/* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" }), "Copy link"] }) })
                  ] })
                ]
              }), /* end dropdown */ /* @__PURE__ */ jsx(TooltipContent, { sideOffset: 6, children: "Share" })] }) }), /* end TooltipTrigger */] }) }),
          ] }),
          attendees > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-border", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
              attendees,
              "+"
            ] }),
            " students interested"
          ] }) })
        ] })
      ]
    }
  );
};
var EventCard_default = EventCard;
export {
  EventCard_default as default
};
