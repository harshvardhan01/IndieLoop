import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SupportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportForm({ isOpen, onClose }: SupportFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/support", data);
    },
    onSuccess: () => {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setFormData({ name: "", email: "", phone: "", message: "" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-craft-brown mb-2">Customer Support</h2>
          <p className="text-gray-600">We're here to help! Send us a message.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus:ring-craft-brown focus:border-craft-brown"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="focus:ring-craft-brown focus:border-craft-brown"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="focus:ring-craft-brown focus:border-craft-brown"
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              required
              className="focus:ring-craft-brown focus:border-craft-brown"
            />
          </div>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-craft-brown hover:bg-craft-brown/90"
          >
            {submitMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}