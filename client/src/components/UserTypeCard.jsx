import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
const UserTypeCard = ({ icon: Icon, title, onClick, delay = 0 }) => {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay },
      whileHover: {
        y: -8,
        boxShadow: "0 12px 40px -8px rgba(255, 122, 0, 0.25)",
        transition: { duration: 0.3 }
      },
      whileTap: { scale: 0.98 },
      onClick,
      className: "group relative bg-card border border-border rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:border-primary/50",
      style: { boxShadow: "0 4px 24px -4px rgba(255, 122, 0, 0.1)" },
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-2xl bg-orange-light flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110", children: /* @__PURE__ */ jsx(Icon, { className: "w-10 h-10 text-foreground group-hover:text-primary-foreground transition-colors duration-300" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300", children: title })
      ] })
    }
  );
};
var UserTypeCard_default = UserTypeCard;
export {
  UserTypeCard_default as default
};
