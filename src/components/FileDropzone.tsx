import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onTextPaste: (text: string) => void;
  acceptedFormats: string[];
  placeholder: string;
  fileContent: string | null;
}

const FileDropzone = ({
  onFileSelect,
  onTextPaste,
  acceptedFormats,
  placeholder,
  fileContent,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handlePaste = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onTextPaste(e.target.value);
    },
    [onTextPaste]
  );

  return (
    <div
      className={cn(
        "relative min-h-[200px] rounded-lg dropzone-border bg-secondary/30 transition-all duration-300",
        isDragging && "active border-primary bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {fileContent ? (
        <textarea
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-foreground text-sm font-mono resize-none focus:outline-none focus:ring-0 rounded-lg"
          value={fileContent}
          onChange={handlePaste}
          placeholder={placeholder}
        />
      ) : (
        <label className="flex flex-col items-center justify-center h-full min-h-[200px] cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept={acceptedFormats.join(",")}
            onChange={handleFileInput}
          />
          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">{placeholder}</p>
        </label>
      )}
    </div>
  );
};

export default FileDropzone;