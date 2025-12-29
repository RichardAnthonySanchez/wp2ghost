import { useState, useCallback } from "react";
import { ArrowLeftRight, Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FormatSelector, { FormatType } from "./FormatSelector";
import FileDropzone from "./FileDropzone";
import { toast } from "@/hooks/use-toast";
import { convert } from "@/services/converter";

// Example data for demonstration
const EXAMPLE_WORDPRESS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>My WordPress Blog</title>
    <link>https://example.com</link>
    <description>A sample WordPress export</description>
    <wp:wxr_version>1.2</wp:wxr_version>
    <item>
      <title>Hello World</title>
      <wp:post_type>post</wp:post_type>
      <wp:status>publish</wp:status>
      <content:encoded><![CDATA[Welcome to WordPress!]]></content:encoded>
    </item>
  </channel>
</rss>`;

const EXAMPLE_GHOST_JSON = `{
  "db": [{
    "meta": {
      "exported_on": 1703865600000,
      "version": "6.0.0"
    },
    "data": {
      "posts": [{
        "title": "Hello World",
        "slug": "hello-world",
        "status": "published",
        "html": "<p>Welcome to Ghost!</p>"
      }]
    }
  }]
}`;

const ConverterCard = () => {
  const [inputFormat, setInputFormat] = useState<FormatType>("wordpress-xml");
  const [outputFormat, setOutputFormat] = useState<FormatType>("ghostpro-json");
  const [ghostVersion, setGhostVersion] = useState("6.0.0");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [convertedContent, setConvertedContent] = useState<string | null>(null);
  const [includeCustomFields, setIncludeCustomFields] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleSwap = useCallback(() => {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
    setFileContent(null);
    setConvertedContent(null);
  }, [inputFormat, outputFormat]);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setConvertedContent(null);
    };
    reader.readAsText(file);
  }, []);

  const handleTextPaste = useCallback((text: string) => {
    setFileContent(text);
    setConvertedContent(null);
  }, []);

  const handleLoadExample = useCallback(() => {
    const example = inputFormat === "wordpress-xml"
      ? EXAMPLE_WORDPRESS_XML
      : EXAMPLE_GHOST_JSON;
    setFileContent(example);
    setConvertedContent(null);
    toast({
      title: "Example loaded",
      description: `Loaded example ${inputFormat === "wordpress-xml" ? "WordPress XML" : "Ghost JSON"} content`,
    });
  }, [inputFormat]);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = inputFormat === "wordpress-xml" ? ".xml" : ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  }, [inputFormat, handleFileSelect]);

  const handleConvert = useCallback(() => {
    if (!fileContent) {
      toast({
        title: "No content to convert",
        description: "Please upload a file or paste content first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    // Short timeout to allow UI to show "Converting..." state
    setTimeout(() => {
      const result = convert(
        fileContent,
        inputFormat === "wordpress-xml" ? "wp-to-ghost" : "ghost-to-wp",
        { ghostVersion }
      );

      if (result.error) {
        toast({
          title: "Conversion failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setConvertedContent(result.output);
        toast({
          title: "Conversion complete",
          description: `Successfully converted to ${outputFormat === "ghostpro-json" ? "GhostPro JSON" : "WordPress XML"}`,
        });
      }
      setIsConverting(false);
    }, 100);
  }, [fileContent, inputFormat, outputFormat, ghostVersion]);

  const handleDownload = useCallback(() => {
    if (!convertedContent) return;

    const blob = new Blob([convertedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFormat === "ghostpro-json"
      ? `ghost-export-v${ghostVersion}.json`
      : "wordpress-export.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: `Your ${outputFormat === "ghostpro-json" ? "GhostPro JSON" : "WordPress XML"} file has been downloaded`,
    });
  }, [convertedContent, outputFormat, ghostVersion]);

  const getPlaceholder = () => {
    return inputFormat === "wordpress-xml"
      ? "Drop your WordPress XML file here or paste data..."
      : "Drop your GhostPro JSON file here or paste data...";
  };

  const getAcceptedFormats = () => {
    return inputFormat === "wordpress-xml" ? [".xml"] : [".json"];
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl mx-auto glow-effect">
      {/* Format Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 mb-6">
        <FormatSelector
          label="Input Format"
          value={inputFormat}
          onChange={setInputFormat}
        />

        <Button
          variant="swap"
          size="icon"
          onClick={handleSwap}
          className="self-center shrink-0 mt-6"
          title="Swap formats"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </Button>

        <FormatSelector
          label="Output Format"
          value={outputFormat}
          onChange={setOutputFormat}
          showVersionDropdown={true}
          version={ghostVersion}
          onVersionChange={setGhostVersion}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleLoadExample}>
          <FileText className="w-4 h-4 mr-1" />
          Load Example
        </Button>
        <Button variant="outline" size="sm" onClick={handleUploadClick}>
          <Upload className="w-4 h-4 mr-1" />
          Upload File
        </Button>
      </div>

      {/* Dropzone */}
      <FileDropzone
        onFileSelect={handleFileSelect}
        onTextPaste={handleTextPaste}
        acceptedFormats={getAcceptedFormats()}
        placeholder={getPlaceholder()}
        fileContent={fileContent}
      />

      {/* Options */}
      <div className="flex items-center gap-2 mt-4">
        <Checkbox
          id="custom-fields"
          checked={includeCustomFields}
          onCheckedChange={(checked) => setIncludeCustomFields(checked === true)}
        />
        <label
          htmlFor="custom-fields"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Include custom fields
        </label>
      </div>

      {/* Convert Button */}
      <Button
        variant="gradient"
        size="lg"
        className="w-full mt-6"
        onClick={handleConvert}
        disabled={!fileContent || isConverting}
      >
        {isConverting ? (
          <>
            <span className="animate-pulse">Converting...</span>
          </>
        ) : (
          <>Convert to {outputFormat === "ghostpro-json" ? "GhostPro JSON" : "WordPress XML"}</>
        )}
      </Button>

      {/* Download Button */}
      {convertedContent && (
        <Button
          variant="outline"
          size="lg"
          className="w-full mt-3"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download {outputFormat === "ghostpro-json" ? `ghost-export-v${ghostVersion}.json` : "wordpress-export.xml"}
        </Button>
      )}
    </div>
  );
};

export default ConverterCard;