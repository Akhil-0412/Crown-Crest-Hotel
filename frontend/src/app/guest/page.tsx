"use client";

import { useState } from "react";
import { getBookingAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, CreditCard, CheckCircle2, Copy, Check } from "lucide-react";

export default function GuestPortal() {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (booking?.reference) {
      navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBooking(null);
    const formData = new FormData(e.currentTarget);
    const ref = formData.get("ref") as string;
    const name = formData.get("name") as string;
    
    const res = await getBookingAction(ref, name);
    
    const responseData = res.data as any;
    if (res.success && responseData && responseData[0]) {
      if (responseData[0].error) {
        setError(responseData[0].error);
      } else {
        setBooking(responseData[0]);
      }
    } else {
      setError(res.error || "Failed to retrieve booking.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-6 text-zinc-50 font-sans">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-amber-500 flex items-center gap-3">
              <Search className="w-8 h-8" /> Guest Portal
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Lookup your booking using your reference number and full name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Reference Number</label>
                <Input name="ref" required className="bg-zinc-950 border-zinc-800 text-white font-mono uppercase" placeholder="CCL1A2BSTR" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Full Name</label>
                <Input name="name" required className="bg-zinc-950 border-zinc-800 text-white" placeholder="John Doe" />
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? "Searching..." : "Find Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {booking && (
          <Card className="bg-zinc-900 border-amber-500/30 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <CardHeader className="border-b border-zinc-800 pb-6 bg-zinc-950">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Booking Reference</p>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl font-mono text-zinc-100">{booking.reference}</CardTitle>
                    <button 
                      onClick={handleCopy}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition-colors"
                      title="Copy Reference"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider ${
                  booking.status === 'BOOKED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  booking.status === 'LOCKED' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {booking.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-zinc-500 text-sm">Guest</p>
                  <p className="text-zinc-200 font-medium">{booking.guest_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Room</p>
                  <p className="text-zinc-200 font-medium capitalize">{booking.room_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-in</p>
                  <p className="text-zinc-200 font-medium">{booking.arrival_date}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-out</p>
                  <p className="text-zinc-200 font-medium">{booking.checkout_date}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Total Cost</p>
                  <p className="text-zinc-200 font-medium">£{booking.total_cost}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Amount Paid</p>
                  <p className="text-zinc-200 font-medium">£{booking.amount_paid}</p>
                </div>
              </div>
            </CardContent>
            {booking.status === 'LOCKED' && (
              <CardFooter className="bg-zinc-950 border-t border-zinc-800 pt-6">
                <div className="w-full">
                  <p className="text-amber-500 text-sm text-center mb-4">
                    Your booking is locked but unpaid. Please complete your payment to secure your room.
                  </p>
                  <a href={`https://akhil-008-olivia-hotel-receptionist.hf.space/?pay=${booking.reference}`} target="_blank" rel="noreferrer">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-14 text-lg">
                      <CreditCard className="w-5 h-5 mr-2" /> Pay £{booking.total_cost} Now
                    </Button>
                  </a>
                </div>
              </CardFooter>
            )}
            {booking.status === 'BOOKED' && (
              <CardFooter className="bg-zinc-950 border-t border-zinc-800 pt-6">
                <div className="w-full flex items-center justify-center text-green-400 gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Fully Paid & Confirmed</span>
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
