import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/api/client";
import { User, Phone, Globe, Bell, Camera, ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/constants";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, updateUser, logout } = useAuth();

  // Personal details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [profileImage, setProfileImage] = useState("");

  // Saving states
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Image upload and cropping states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Initialize profile fields
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setCountry(user.country || "");
      setLanguage(user.language || "en");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  // Load selected image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas rendering of image with pan and zoom
  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imgRef.current = img;
        drawCanvas();
      };
    }
  }, [imageSrc, zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background placeholder
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image with zoom and pan offsets
    ctx.save();
    
    // Move to center of canvas
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    
    // Scale according to zoom factor
    ctx.scale(zoom, zoom);

    // Draw image centered at 0,0
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgRatio > 1) {
      drawHeight = canvas.width / imgRatio;
    } else {
      drawWidth = canvas.height * imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw circular masking guideline overlay
    ctx.save();
    ctx.strokeStyle = "rgba(79, 70, 229, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Darken outside the circle
    ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 10, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.restore();
  };

  // Dragging event handlers for panning the image inside crop box
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Perform client-side crop to final 256x256 circular crop Data URL
  const applyCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    // Create offscreen high-res crop canvas
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = 256;
    cropCanvas.height = 256;
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return;

    // Draw zoomed and panned image to crop size
    cropCtx.save();
    cropCtx.translate(128, 128); // center in crop
    cropCtx.scale(zoom * (256 / canvas.width), zoom * (256 / canvas.height));
    cropCtx.translate(pan.x * (canvas.width / 256), pan.y * (canvas.height / 256));

    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgRatio > 1) {
      drawHeight = canvas.width / imgRatio;
    } else {
      drawWidth = canvas.height * imgRatio;
    }

    cropCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    cropCtx.restore();

    const croppedDataUrl = cropCanvas.toDataURL("image/jpeg", 0.9);
    setProfileImage(croppedDataUrl);
    setImageSrc(null); // Close crop panel
    setSelectedFile(null);
    toast.success("Profile photo cropped. Click Save Preferences to publish!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiClient.put("/auth/profile", {
        fullName,
        phone,
        country,
        profileImage,
        language,
      });

      if (response.data?.success && response.data?.user) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeleting(true);
    try {
      const response = await apiClient.delete(`/users/${user?.id}`);
      if (response.data?.success) {
        toast.success("Account deactivated successfully.");
        setDeleteOpen(false);
        await logout();
        setLocation("/");
      }
    } catch (e) {
      toast.error("Failed to deactivate account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8 animate-slide-in-down">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <User className="text-indigo-600" />
              My Profile
            </h1>
            <p className="text-slate-600">
              Manage your personal FIFA World Cup 2026 avatar and profile credentials
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-slide-in-up">
            {/* Left Column: Avatar & Quick Stats */}
            <div className="space-y-6">
              <Card className="shadow border border-slate-200 bg-white">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="relative inline-block mx-auto group">
                    <img
                      src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-transform group-hover:scale-110 btn-press"
                      title="Upload photo"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{fullName || user?.fullName}</h3>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{user?.role} Profile</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Crop Modal / Panel */}
              {imageSrc && (
                <Card className="shadow border border-indigo-200 bg-white border-2 animate-scale-in">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-bold text-indigo-950">Crop Profile Photo</CardTitle>
                    <CardDescription className="text-[11px]">Drag to adjust position, slider to zoom</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-center">
                      <canvas
                        ref={canvasRef}
                        width={200}
                        height={200}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="border border-slate-200 rounded-lg cursor-move bg-slate-100 touch-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600 flex justify-between">
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageSrc(null);
                          setSelectedFile(null);
                        }}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyCrop}
                        className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        Apply Crop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Personal details & Settings */}
            <div className="md:col-span-2 space-y-6">
              <form onSubmit={handleSave} className="space-y-6">
                <Card className="shadow border border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Personal Details</CardTitle>
                    <CardDescription>Update your personal information and contact credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          disabled={saving}
                          className="btn-press focus:ring-indigo-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={saving}
                          type="tel"
                          className="btn-press focus:ring-indigo-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Country of Residence</label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        disabled={saving}
                        className="btn-press focus:ring-indigo-600"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="shadow border border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Preferences</CardTitle>
                    <CardDescription>Select language and alerts configurations</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Preferred Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={saving}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 btn-press"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Notification Alerts</label>
                      <div className="flex items-center gap-2 pt-2.5">
                        <input
                          type="checkbox"
                          id="pushNotif"
                          defaultChecked
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 btn-press"
                        />
                        <label htmlFor="pushNotif" className="text-sm text-slate-600">
                          Receive live queue & match updates
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-press bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving Details..." : "Save Preferences"}
                  </Button>
                </div>
              </form>

              {/* Account Security Danger Zone */}
              <Card className="shadow border border-red-200 bg-red-50/10">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-950 flex items-center gap-2">
                    <ShieldAlert className="text-red-600" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-700/80">Deactivate your StadiumIQ profile credentials</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Deactivate Account</h4>
                    <p className="text-xs text-slate-500 max-w-md mt-0.5">
                      Temporarily disable your profile, logged tickets, and history. You can contact support to reactivate.
                    </p>
                  </div>
                  <Button
                    onClick={() => setDeleteOpen(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 font-semibold btn-press"
                  >
                    Deactivate Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Custom AlertDialog for Deactivation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 text-center">
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 text-center leading-relaxed">
              This action will immediately log you out, revoke all active sessions, and mark your StadiumIQ profile as inactive. Your details will be archived securely.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-stretch pt-4 border-t border-slate-100">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 text-slate-700 btn-press">
                No, Keep Account
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeactivate}
              disabled={deleting}
              className="flex-1 btn-press bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
