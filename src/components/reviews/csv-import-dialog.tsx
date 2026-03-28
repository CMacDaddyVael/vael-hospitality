"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, Loader2, Check } from "lucide-react";

type ImportResult = {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
};

export function CsvImportDialog({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState("booking_com");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = useCallback(async () => {
    if (!file) return;
    setImporting(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("platform", platform);
    formData.append("propertyId", propertyId);

    try {
      const res = await fetch("/api/reviews/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      router.refresh();
    } catch {
      setResult({ total: 0, imported: 0, skipped: 0, errors: 1 });
    } finally {
      setImporting(false);
    }
  }, [file, platform, propertyId, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background h-9 px-3 hover:bg-accent hover:text-accent-foreground">
        <Upload className="h-4 w-4" />
        Import CSV
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Reviews from CSV</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Import Complete</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>Total rows: {result.total}</div>
              <div>Imported: {result.imported}</div>
              <div>Skipped (duplicates): {result.skipped}</div>
              <div>Errors: {result.errors}</div>
            </div>
            <Button onClick={() => { setOpen(false); setResult(null); setFile(null); }}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_com">Booking.com</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span>{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-500 underline text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">CSV files only</p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Expected columns: reviewer_name, rating, title (optional), body, date
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Reviews"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
