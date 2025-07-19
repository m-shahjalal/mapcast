"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Globe, Smartphone, ChevronRight, X } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <Globe className="h-12 w-12 text-blue-500" />,
      title: "Welcome to Global News Map",
      description:
        "Discover breaking news from around the world on an interactive map. Stay informed about global events as they happen.",
    },
    {
      icon: <MapPin className="h-12 w-12 text-green-500" />,
      title: "Explore News by Location",
      description:
        "Tap on pins to read news from specific locations. Pinch to zoom and drag to explore different regions of the world.",
    },
    {
      icon: <Search className="h-12 w-12 text-purple-500" />,
      title: "Search & Filter",
      description: "Use the search bar to find specific topics or filter news by country, category, and time period.",
    },
    {
      icon: <Smartphone className="h-12 w-12 text-orange-500" />,
      title: "Mobile Optimized",
      description: "Access news offline, get location-based updates, and enjoy a seamless mobile experience.",
    },
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const skipTutorial = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={skipTutorial}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">{steps[currentStep].icon}</div>
            <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={skipTutorial}>
              Skip Tutorial
            </Button>
            <Button onClick={nextStep}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
