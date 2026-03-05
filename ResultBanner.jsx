import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsBanner({ count, city, bank, hasSearched }) {
  if (!hasSearched) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto"
      >
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium ${
          count > 0 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60" 
            : "bg-amber-50 text-amber-800 border border-amber-200/60"
        }`}>
          {count > 0 ? (
            <>
              <Navigation className="w-4 h-4 flex-shrink-0" />
              <span>
                Found <strong>{count}</strong> ATM{count !== 1 ? "s" : ""} near{" "}
                <strong>{city}</strong> for <strong>{bank}</strong>
              </span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>
                No ATMs found near <strong>{city}</strong> for <strong>{bank}</strong>. Try a broader search.
              </span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
