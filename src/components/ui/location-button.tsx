"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";

interface LocationButtonProps {
  onLocationFound: (location: { lat: number; lng: number }) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function LocationButton({
  onLocationFound,
  userLocation,
}: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationFound(location);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        console.error("Error getting location:", error);
        alert("Unable to location. Please check your browser settings.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  };

  return (
    <Button
      variant={userLocation ? "default" : "outline"}
      size="sm"
      onClick={getCurrentLocation}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      {userLocation ? "Location Found" : "Find My Location"}
    </Button>
  );
}
