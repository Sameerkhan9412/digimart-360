import Link from "next/link"
import { Globe, Mail, Phone, MapPin, Award, CheckCircle, ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-900 mt-auto">
      
      {/* Trust & Quality Indicators Bar */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">100% Verified Exporters</h5>
              <p className="text-xs text-slate-400 mt-1">Every business profile undergoes rigorous certificate checkups before registration.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Direct Wholesale Quotes</h5>
              <p className="text-xs text-slate-400 mt-1">Eliminate middleman fees. Request direct price sheets from manufacturers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-accent/10 rounded-xl text-accent shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">AI Lead Scoring Engine</h5>
              <p className="text-xs text-slate-400 mt-1">Sellers utilize advanced GPT scoring parameters to track buyer requirements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* About Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
              <span className="font-extrabold text-white text-sm">D</span>
            </div> */}
              <Image src="/logo.jpeg" alt="Logo" width={120} height={48} className="w-auto" />
            
            {/* <span className="font-bold text-white text-md tracking-tight">
              DIGIMART<span className="text-primary">360</span>
            </span> */}
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            DIGIMART360 is India's leading next-generation B2B portal. Bridging the gap between global procurement divisions and quality local manufacturing.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Globe className="w-4 h-4 text-primary" />
            <span>Serving 120+ Countries</span>
          </div>
        </div>

        {/* Popular Industries */}
        <div>
          <h6 className="font-bold text-white text-xs tracking-wider uppercase mb-4">Trade Sectors</h6>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li><Link href="/search?category=industrial-machinery" className="hover:text-primary transition">Industrial Machinery</Link></li>
            <li><Link href="/search?category=chemicals-materials" className="hover:text-primary transition">Chemicals & Organics</Link></li>
            <li><Link href="/search?category=electronics-electrical" className="hover:text-primary transition">Electronics & Appliances</Link></li>
            <li><Link href="/search?category=apparel-textiles" className="hover:text-primary transition">Apparel & Fabrics</Link></li>
            <li><Link href="/search?category=medical-surgical" className="hover:text-primary transition">Medical Supplies</Link></li>
          </ul>
        </div>

        {/* Resources / Links */}
        <div>
          <h6 className="font-bold text-white text-xs tracking-wider uppercase mb-4">Seller Resources</h6>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li><Link href="/seller" className="hover:text-primary transition">Seller Dashboard</Link></li>
            <li><Link href="/auth/register?role=seller" className="hover:text-primary transition">Register as Supplier</Link></li>
            <li><Link href="/seller/billing" className="hover:text-primary transition">Premium Plans pricing</Link></li>
            <li><Link href="/admin/settings" className="hover:text-primary transition">Admin Settings</Link></li>
            <li><Link href="/search" className="hover:text-primary transition">RFQs Board</Link></li>
          </ul>
        </div>

        {/* Corporate Address & Contact */}
        <div className="flex flex-col gap-3">
          <h6 className="font-bold text-white text-xs tracking-wider uppercase mb-4">Global Trade Center</h6>
          <div className="flex items-start gap-2.5 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>N-360 Sector V, Salt Lake Electronics Complex, Kolkata, India</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <span>+91 33 3603 6000</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <span>support@digimart360.com</span>
          </div>
        </div>

      </div>

      {/* Copyright Notice */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DIGIMART360 Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
