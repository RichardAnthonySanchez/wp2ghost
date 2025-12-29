import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormatType = "wordpress-xml" | "ghostpro-json";

interface FormatSelectorProps {
  label: string;
  value: FormatType;
  onChange: (value: FormatType) => void;
  showVersionDropdown?: boolean;
  version?: string;
  onVersionChange?: (version: string) => void;
}

const FormatSelector = ({
  label,
  value,
  onChange,
  showVersionDropdown = false,
  version,
  onVersionChange,
}: FormatSelectorProps) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as FormatType)}>
        <SelectTrigger className="w-full bg-secondary border-border hover:border-primary/50 transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="wordpress-xml">WordPress XML</SelectItem>
          <SelectItem value="ghostpro-json">GhostPro JSON</SelectItem>
        </SelectContent>
      </Select>

      {showVersionDropdown && value === "ghostpro-json" && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Ghost Version
          </label>
          <Select value={version} onValueChange={onVersionChange}>
            <SelectTrigger className="w-full bg-secondary border-border hover:border-primary/50 transition-colors text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="6.0.0">Version 6.x (Latest)</SelectItem>
              <SelectItem value="5.0.0">Version 5.x</SelectItem>
              <SelectItem value="4.0.0">Version 4.x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default FormatSelector;