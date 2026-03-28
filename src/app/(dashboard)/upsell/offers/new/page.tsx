"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUpsellOffer } from "@/actions/upsell-offers";
import { useApp } from "@/lib/hooks/use-active-property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UPSELL_CATEGORIES, UPSELL_PRICE_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewOfferPage() {
  const router = useRouter();
  const { activeProperty } = useApp();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [commission, setCommission] = useState("10");

  const handleSubmit = async () => {
    if (!activeProperty) return;
    setSaving(true);
    const result = await createUpsellOffer(activeProperty.id, {
      name,
      category,
      description,
      price: parseFloat(price) || undefined,
      price_type: priceType,
      commission_rate: parseFloat(commission) / 100,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Offer created");
      router.push("/upsell/offers");
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Create Upsell Offer</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Offer Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Deluxe Room Upgrade" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {UPSELL_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what the guest gets..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Price Type</Label>
              <Select value={priceType} onValueChange={(v) => v && setPriceType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UPSELL_PRICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Commission Rate (%)</Label>
            <Input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="10" />
          </div>
          <Button onClick={handleSubmit} disabled={saving || !name || !category} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Offer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
