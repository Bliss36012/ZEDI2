import { Home, Users, Calendar, Bell, BarChart3, Settings, LogOut, Download, Wifi, WifiOff, X, Database, FileText, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { useRef, ChangeEvent, useState } from 'react';
import { ReportCenter } from './ReportCenter';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
  isOnline: boolean;
  canInstall: boolean;
  onInstall: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  username, 
  isOnline, 
  canInstall, 
  onInstall,
  isOpen,
  onClose
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        const result = await storage.restoreData(content);
        if (result.success) {
          alert('Data restored successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('Failed to restore data: ' + result.error);
        }
      } catch (err) {
        alert('Invalid backup file. Please select a valid .json backup.');
      }
    };
    reader.readAsText(file);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <>
      <ReportCenter isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-screen transition-transform duration-300 lg:sticky lg:translate-x-0 lg:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-deep flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-deep rounded-lg flex items-center justify-center text-white font-serif text-xl">S</div>
              Siha Angavu
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold px-1">{username}</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === item.id 
                  ? "bg-primary-soft text-primary-deep font-medium" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
            isOnline ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          )}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'System Online' : 'Offline Mode Active'}
          </div>

          {canInstall && (
            <Button 
              onClick={onInstall}
              className="w-full justify-start gap-3 bg-primary-soft text-primary-deep hover:bg-primary-deep hover:text-white rounded-xl mb-2"
            >
              <Download className="w-4 h-4" />
              Install App
            </Button>
          )}

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-primary-deep hover:bg-primary-soft"
            onClick={() => setIsReportOpen(true)}
          >
            <FileText className="w-5 h-5" />
            Report Center
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-primary-deep hover:bg-primary-soft"
            onClick={() => storage.exportData()}
          >
            <Database className="w-5 h-5" />
            Backup Data
          </Button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json" 
            className="hidden" 
          />
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-primary-deep hover:bg-primary-soft"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            Import Backup
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}

