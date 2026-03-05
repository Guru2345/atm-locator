import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Banknote, MapPin } from "lucide-react";
import SearchBar from "@/components/atm/SearchBar";
import AtmMap from "@/components/atm/AtmMap";
import ResultsBanner from "@/components/atm/ResultsBanner";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(2);
  const [atms, setAtms] = useState([]);
  const [searchInfo, setSearchInfo] = useState({ city: "", bank: "", hasSearched: false });

  const fetchAtms = async (lat, lon, bank, locationLabel) => {
    setMapCenter([lat, lon]);
    setMapZoom(15);

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];node["amenity"="atm"](around:5000,${lat},${lon});out;`)}`;
    const atmResponse = await fetch(overpassUrl);
    const atmData = await atmResponse.json();

    const atmList = atmData.elements.map((atm) => ({
      lat: atm.lat,
      lon: atm.lon,
      name: atm.tags?.brand || atm.tags?.operator || atm.tags?.name || bank,
      address: atm.tags?.["addr:street"] || atm.tags?.["addr:full"] || null,
    }));

    setAtms(atmList);
    setSearchInfo({ city: locationLabel, bank, hasSearched: true });
    setIsLoading(false);

    if (atmList.length === 0) {
      toast.info("No ATMs found nearby. Try a different bank name.");
    }
  };

  // Search by city name
  const handleSearch = useCallback(async (city, bank) => {
    setIsLoading(true);
    setSearchInfo({ city, bank, hasSearched: false });

    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (geoData.length === 0) {
      toast.error("Location not found. Please try another area.");
      setIsLoading(false);
      return;
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    await fetchAtms(lat, lon, bank, city);
  }, []);

  // Search by GPS coordinates (current location)
  const handleSearchByCoords = useCallback(async (lat, lon, bank) => {
    setIsLoading(true);
    setSearchInfo({ city: "Your Location", bank, hasSearched: false });

    // Reverse geocode to get a human-readable label
    let locationLabel = "Your Location";
    const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const revRes = await fetch(revUrl);
    const revData = await revRes.json();
    if (revData?.address) {
      locationLabel = revData.address.city || revData.address.town || revData.address.village || revData.address.county || "Your Location";
    }

    await fetchAtms(lat, lon, bank, locationLabel);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-sky-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/60 text-blue-700 text-xs font-semibold tracking-wide mb-4 border border-blue-200/40">
            <Banknote className="w-3.5 h-3.5" />
            FIND CASH FAST
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            ATM Locator
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Search any city and bank to find the nearest ATMs in seconds
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-5"
        >
          <SearchBar onSearch={handleSearch} onSearchByCoords={handleSearchByCoords} isLoading={isLoading} />
        </motion.div>

        {/* Results banner */}
        <div className="mb-5">
          <ResultsBanner
            count={atms.length}
            city={searchInfo.city}
            bank={searchInfo.bank}
            hasSearched={searchInfo.hasSearched}
          />
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AtmMap
            center={mapCenter}
            zoom={mapZoom}
            atms={atms}
            bankName={searchInfo.bank}
          />
        </motion.div>

        {/* Footer hint */}
        {!searchInfo.hasSearched && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3 h-3" />
            Data powered by OpenStreetMap
          </motion.p>
        )}
      </div>
    </div>
  );
}
