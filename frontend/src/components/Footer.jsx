import { Link } from 'react-router-dom'
import { Scale, Home, Info, Users, FileText, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Shield, FileCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <Scale className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-bold text-xl">LawLinkPro</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting clients with verified legal professionals through intelligent AI-powered matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <Home className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <Info className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/lawyers" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <Users className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Find Lawyers</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <Shield className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <FileCheck className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <FileText className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span>Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-3">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>info@lawlinkpro.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+977 1-4445678</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} LawLinkPro. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
