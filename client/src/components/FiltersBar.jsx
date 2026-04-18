import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
const FiltersBar = ({ activeFilters, onFilterChange, searchValue, onSearchChange, sortBy, onSortChange }) => {
  const careerFilters = ["Placement", "Internship", "Research", "Startup", "Skills"];
  const skillFilters = ["AI/ML", "Robotics", "IoT", "CAD", "Finance", "Biotech", "Cybersecurity", "Web Dev"];
  const sortOptions = [
    { icon: Sparkles, label: "AI Picks", value: "ai" },
    { icon: TrendingUp, label: "Trending", value: "trending" },
    { icon: Clock, label: "Deadline Soon", value: "deadline" }
  ];
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      onFilterChange(activeFilters.filter((f) => f !== filter));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-border rounded-3xl p-6 mb-8",
      style: { boxShadow: "0 4px 24px -4px rgba(255, 122, 0, 0.1)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Search events, workshops, internships...",
              value: searchValue,
              onChange: (e) => onSearchChange?.(e.target.value),
              className: "pl-12 pr-4 h-12 rounded-xl border-border focus:border-primary bg-background"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-foreground", children: "Career Path" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: careerFilters.map((filter) => /* @__PURE__ */ jsx(
            Badge,
            {
              onClick: () => toggleFilter(filter),
              className: `cursor-pointer px-4 py-2 rounded-xl transition-all ${activeFilters.includes(filter) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-orange-light"}`,
              children: filter
            },
            filter
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-foreground mb-3", children: "Skills & Domains" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: skillFilters.map((filter) => /* @__PURE__ */ jsx(
            Badge,
            {
              onClick: () => toggleFilter(filter),
              className: `cursor-pointer px-4 py-2 rounded-xl transition-all ${activeFilters.includes(filter) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-orange-light"}`,
              children: filter
            },
            filter
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Sort by:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: sortOptions.map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs(
            Button,
            {
              variant: sortBy === value ? "default" : "outline",
              size: "sm",
              onClick: () => onSortChange?.(value),
              className: `rounded-xl border-border hover:border-primary hover:bg-orange-light ${sortBy === value ? "bg-primary text-primary-foreground" : ""}`,
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 mr-2" }),
                label
              ]
            },
            value
          )) })
        ] })
      ]
    }
  );
};
var FiltersBar_default = FiltersBar;
export {
  FiltersBar_default as default
};
