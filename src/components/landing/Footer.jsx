
import React from 'react';
import { Sparkles, Twitter, Linkedin, Instagram, Mail, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Demo', href: '#demo' }
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' }
  ],
  resources: [
    { label: 'Help Center', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Community', href: '#' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Security', href: '#' }
  ]
};

const socialLinks = [
  { icon: Twitter, href: '#', color: '#93C5FD' },
  { icon: Linkedin, href: '#', color: '#A78BFA' },
  { icon: Instagram, href: '#', color: '#F472B6' },
  { icon: Mail, href: '#', color: '#86EFAC' }
];

export default function Footer() {
  return (
    <footer className="py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div
            className="rounded-[24px] p-8 md:p-12 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `
                0 20px 60px rgba(167, 139, 250, 0.2),
                inset 0 4px 12px rgba(255, 255, 255, 0.9),
                inset 0 -4px 12px rgba(167, 139, 250, 0.15)
              `
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo className="w-10 h-10" />
              <h3 className="text-2xl font-bold text-gray-800">Stay Updated</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get productivity tips, feature updates, and exclusive offers delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-[16px] border-2 border-transparent focus:outline-none focus:border-purple-300 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: `
                    inset 0 2px 8px rgba(167, 139, 250, 0.1),
                    0 2px 8px rgba(167, 139, 250, 0.08)
                  `
                }}
              />
              <button
                className="px-8 py-4 rounded-[16px] text-white font-semibold whitespace-nowrap transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: `
                    0 8px 24px rgba(139, 92, 246, 0.3),
                    inset 0 2px 6px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The all-in-one productivity platform designed for solo professionals to sync their entire workflow.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ y: -4 }}
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: `
                      0 4px 16px rgba(167, 139, 250, 0.15),
                      inset 0 2px 6px rgba(255, 255, 255, 0.8),
                      inset 0 -2px 6px rgba(167, 139, 250, 0.1)
                    `
                  }}
                >
                  <social.icon className="w-5 h-5" style={{ color: social.color }} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-bold text-gray-800 mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t"
          style={{ borderColor: 'rgba(167, 139, 250, 0.15)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm flex items-center gap-2">
              © 2025 SoloSync. Made with{' '}
              <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for solo professionals
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-purple-600 transition-colors">
                Status
              </a>
              <a href="#" className="hover:text-purple-600 transition-colors">
                Changelog
              </a>
              <a href="#" className="hover:text-purple-600 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
