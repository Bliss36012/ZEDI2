import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Table, Presentation, FileDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportFormat = 'word' | 'excel' | 'ppt' | 'text';
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'semi-annually' | 'annually';

export function ReportCenter({ isOpen, onClose }: ReportCenterProps) {
  const [format, setFormat] = useState<ReportFormat>('word');
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      if (format === 'text') {
        window.location.href = `/api/report`;
      } else {
        window.location.href = `/api/reports/${format}?period=${period}`;
      }
      // Wait a bit to show the loading state
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setIsGenerating(false);
    }
  };

  const formats = [
    { id: 'word', label: 'Word Document', icon: FileText, extension: '.docx', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'excel', label: 'Excel Spreadsheet', icon: Table, extension: '.xlsx', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'ppt', label: 'PowerPoint Slide', icon: Presentation, extension: '.pptx', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'text', label: 'Plain Text Summary', icon: FileDown, extension: '.txt', color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="w-6 h-6 text-primary-deep" />
            Report Center
          </DialogTitle>
          <DialogDescription>
            Select format and period for your clinical performance report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Select Format</label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id as ReportFormat)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                    format === f.id 
                      ? "border-primary-deep bg-primary-soft/30 shadow-sm" 
                      : "border-slate-100 bg-white hover:border-primary-soft hover:bg-slate-50"
                  )}
                >
                  <div className={cn("p-3 rounded-xl", f.bg, f.color)}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-900">{f.label}</p>
                    <p className="text-[10px] text-slate-400">{f.extension}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Time Period</label>
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="daily">Daily Report</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
                <SelectItem value="semi-annually">Semi-Annual Report</SelectItem>
                <SelectItem value="annually">Annual Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            className="w-full h-12 bg-primary-deep hover:bg-teal-800 text-white rounded-xl text-md font-bold shadow-lg shadow-primary-deep/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              'Generate & Download'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
