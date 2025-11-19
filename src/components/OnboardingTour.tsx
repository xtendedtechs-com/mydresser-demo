import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  title: string;
  description: string;
  route?: string;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to MyDresser",
    description: "Your AI-powered wardrobe assistant. Let's take a quick tour of the key features to help you get started.",
  },
  {
    title: "Build Your Wardrobe",
    description: "Start by adding items to your digital wardrobe. Take photos or upload images of your clothing to create your personalized collection.",
    route: "/wardrobe",
    action: "Go to Wardrobe"
  },
  {
    title: "Get Daily Outfit Suggestions",
    description: "The Dresser uses AI to create perfect outfit combinations based on your wardrobe, weather, and occasions.",
    route: "/dresser",
    action: "Explore Dresser"
  },
  {
    title: "Virtual Try-On",
    description: "See how items look on you before buying with our AI-powered virtual try-on feature.",
    route: "/virtual-try-on",
    action: "Try Virtual Try-On"
  },
  {
    title: "Discover New Items",
    description: "Browse the Market for new fashion items and get personalized recommendations based on your style.",
    route: "/market",
    action: "Visit Market"
  },
  {
    title: "You're All Set!",
    description: "You're ready to revolutionize your style with MyDresser. Start exploring and let AI be your personal fashion assistant.",
  }
];

const ONBOARDING_KEY = 'mydresser_onboarding_completed';

export const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step.route) {
      handleClose();
      navigate(step.route);
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className={cn(
        "w-full max-w-lg mx-4",
        "glass-card animate-scale-in"
      )}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
              aria-label="Skip onboarding"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="mb-6 h-1" />

          {/* Content */}
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                onClick={handleAction}
                size="sm"
                className="gap-2"
              >
                {step.action || (isLastStep ? "Get Started" : "Next")}
                {isLastStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook to reset onboarding (useful for testing or user preference)
export const useResetOnboarding = () => {
  return () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };
};
