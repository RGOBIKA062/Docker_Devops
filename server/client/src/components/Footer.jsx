import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
const Footer = () => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "For Students", href: "/student" },
      { name: "For Organizers", href: "/organizer" },
      { name: "For Faculty", href: "/faculty" }
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Blog", href: "#blog" },
      { name: "Press Kit", href: "#press" }
    ],
    support: [
      { name: "Help Center", href: "#help" },
      { name: "Contact Us", href: "#contact" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" }
    ]
  };
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" }
  ];
  return /* @__PURE__ */ jsx("footer", { className: "bg-black text-white border-t border-primary/20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl", children: "ACE" }),
          /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-2xl", children: "AllCollegeEvent" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-white/70 mb-6 max-w-md", children: "Discover, connect, and grow with the ultimate event discovery platform for students, organizers, and professionals." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-white/70", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("a", { href: "mailto:contact@allcollegeevent.com", className: "hover:text-primary transition-colors", children: "contact@allcollegeevent.com" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("a", { href: "tel:+1234567890", className: "hover:text-primary transition-colors", children: "+1 (234) 567-890" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary mt-1 flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: "123 Innovation Street, Tech City, TC 12345" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-4 text-primary", children: "Product" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.product.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          Link,
          {
            to: link.href,
            className: "text-white/70 hover:text-primary transition-colors text-sm",
            children: link.name
          }
        ) }, link.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-4 text-primary", children: "Company" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.company.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            className: "text-white/70 hover:text-primary transition-colors text-sm",
            children: link.name
          }
        ) }, link.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-4 text-primary", children: "Support" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: footerLinks.support.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            className: "text-white/70 hover:text-primary transition-colors text-sm",
            children: link.name
          }
        ) }, link.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-white/10 pt-8 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-2 text-primary", children: "Stay Updated" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-white/70 mb-4", children: "Subscribe to our newsletter for the latest events and features." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            placeholder: "Enter your email",
            className: "flex-1 h-10 px-4 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "px-6 h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md transition-colors", children: "Subscribe" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-white/60", children: [
        "\xA9 ",
        currentYear,
        " AllCollegeEvent. All rights reserved."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: socialLinks.map((social) => /* @__PURE__ */ jsx(
        motion.a,
        {
          href: social.href,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": social.label,
          whileHover: { scale: 1.1 },
          whileTap: { scale: 0.95 },
          className: "w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors",
          children: /* @__PURE__ */ jsx(social.icon, { className: "w-5 h-5" })
        },
        social.label
      )) })
    ] })
  ] }) });
};
var Footer_default = Footer;
export {
  Footer_default as default
};
