import { Helmet } from "react-helmet-async";
import ConverterCard from "@/components/ConverterCard";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>wp-2-ghost | WordPress to GhostPro Converter</title>
        <meta
          name="description"
          content="Convert your WordPress XML exports to GhostPro JSON format and vice versa. Free, fast, and works entirely in your browser."
        />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <header className="text-center mb-12 md:mb-16">
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="gradient-text">wp-2-ghost</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
              WordPress to GhostPro Converter
            </p>
          </header>

          {/* Main Converter */}
          <main>
            <ConverterCard />
          </main>

          {/* Footer */}
          <footer className="mt-16 text-center">
            <p className="text-sm text-muted-foreground/60">
              All processing happens locally in your browser. Your data never leaves your device.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;